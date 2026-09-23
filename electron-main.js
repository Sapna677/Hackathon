/**
 * CareerReady AI - Standalone Desktop Electron Application
 * Manages native window lifecycle and embedded Express backend server.
 */

const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;
let serverProcess = null;

// Enforce single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

/**
 * Checks if backend server is responsive
 */
function checkServerHealth(port = 5000) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Starts the embedded Express backend server
 */
async function ensureBackendStarted() {
  const alreadyRunning = await checkServerHealth(5000);
  if (alreadyRunning) {
    console.log('[Desktop] Embedded backend is already online on port 5000');
    return true;
  }

  console.log('[Desktop] Starting embedded Express backend...');
  try {
    // Run Express server inside Electron's Node runtime
    serverProcess = require(path.join(__dirname, 'Backend', 'server.js'));
  } catch (err) {
    console.error('[Desktop] Failed to initialize backend server:', err);
  }

  // Poll for up to 6 seconds until server is ready
  for (let i = 0; i < 30; i++) {
    const isReady = await checkServerHealth(5000);
    if (isReady) {
      console.log('[Desktop] Backend confirmed healthy and ready!');
      return true;
    }
    await new Promise(r => setTimeout(r, 200));
  }

  return false;
}

/**
 * Creates the primary application window
 */
async function createMainWindow() {
  await ensureBackendStarted();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    center: true,
    title: 'CareerReady AI - AI-Powered Career Readiness Platform',
    backgroundColor: '#f8fafc',
    autoHideMenuBar: true,
    show: false, // Show gracefully once ready-to-show
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Remove default top menu bar for clean modern SaaS desktop look
  Menu.setApplicationMenu(null);

  // Load local web app
  mainWindow.loadURL('http://localhost:5000');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external web links (e.g., documentation or course links) by opening them in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      if (!url.includes('localhost:5000')) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  await createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Gracefully terminate on Windows & Linux
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverProcess && serverProcess.server && typeof serverProcess.server.close === 'function') {
    try {
      serverProcess.server.close();
      console.log('[Desktop] Express server shut down cleanly');
    } catch (_) {}
  }
});
