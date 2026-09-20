/**
 * App Master Router & Initialization Controller
 */

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
window.showToast = showToast;

const App = {
  activeView: 'home',

  init() {
    this.bindNavLinks();
    window.Auth.init();
    window.ResumeManager.init();
    window.JdManager.init();
    window.GapManager.init();
    window.RoadmapManager.init();
    window.QuizManager.init();
    window.ProgressManager.init();
    if (window.AdminManager) window.AdminManager.init();

    // Check hash route or default to home
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      this.navigateTo(hash);
    } else {
      this.navigateTo('home');
    }
  },

  bindNavLinks() {
    document.querySelectorAll('[data-navigate]').forEach(elem => {
      elem.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = elem.getAttribute('data-navigate');
        this.navigateTo(targetView);
      });
    });

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== this.activeView) {
        this.navigateTo(hash, false);
      }
    });
  },

  navigateTo(viewId, updateHash = true) {
    const target = document.getElementById(`view-${viewId}`);
    if (!target) return;

    // Deactivate current view
    document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
    target.classList.add('active');

    // Update active state in nav
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-navigate') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    this.activeView = viewId;
    if (updateHash) {
      window.location.hash = viewId;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger view-specific refreshes
    if (viewId === 'progress' || viewId === 'dashboard') {
      window.ProgressManager.loadDashboardData();
    }
    if (viewId === 'quiz') {
      if (!window.QuizManager.currentQuiz) {
        window.QuizManager.startAssessment();
      }
    }
    if (viewId === 'admin') {
      if (window.AdminManager) {
        window.AdminManager.loadAllAdminData();
      }
    }
  }
};

window.App = App;

// Third-party browser extension containment (e.g., Careerflow Chrome Extension)
function suppressInjectedExtensions() {
  try {
    const extensionSelectors = [
      '[id*="careerflow" i]',
      '[class*="careerflow" i]',
      '[data-careerflow]',
      'img[alt*="Careerflow" i]',
      'img[alt="hello"]',
      '[aria-label*="Careerflow" i]'
    ];
    
    extensionSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const wrapper = el.closest('div:not(.view-container):not(.navbar):not(.app-footer)') || el;
        wrapper.style.setProperty('display', 'none', 'important');
        wrapper.style.setProperty('visibility', 'hidden', 'important');
        wrapper.style.setProperty('height', '0px', 'important');
      });
    });

    // Check any rogue injected text blocks at document body level
    Array.from(document.body.children).forEach(child => {
      if (!child.matches('nav, .view-container, footer, .toast-container, script, link, style')) {
        const text = child.innerText || child.textContent || '';
        if (text.includes('Careerflow') || text.includes('iAmYourCareerCopilot') || text.includes('SaveJobToTracker')) {
          child.style.setProperty('display', 'none', 'important');
        }
      }
    });
  } catch (e) {
    // Silent fail safe
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  suppressInjectedExtensions();
  setTimeout(suppressInjectedExtensions, 500);
  setTimeout(suppressInjectedExtensions, 1500);
  setTimeout(suppressInjectedExtensions, 3000);
});

