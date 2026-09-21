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

/**
 * Smooth SaaS Number Counter Animation using easeOutExpo
 */
function animateCountUp(element, start, end, duration = 1000, suffix = '') {
  if (!element) return;
  const numStart = typeof start === 'number' ? start : (parseFloat(String(start).replace(/[^\d.-]/g, '')) || 0);
  const numEnd = typeof end === 'number' ? end : (parseFloat(String(end).replace(/[^\d.-]/g, '')) || 0);

  if (isNaN(numEnd)) {
    element.textContent = `${end}${suffix}`;
    return;
  }

  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth easeOutExpo curve
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const currentVal = Math.round(numStart + (numEnd - numStart) * ease);

    element.textContent = `${currentVal}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = `${numEnd}${suffix}`;
    }
  }

  requestAnimationFrame(update);
}
window.animateCountUp = animateCountUp;

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
    if (window.ChatbotManager) window.ChatbotManager.init();

    // Check hash route or default to home/admin
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      this.navigateTo(hash);
    } else if (window.Auth && window.Auth.isAdmin()) {
      this.navigateTo('admin');
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
    const isAdmin = window.Auth && window.Auth.isAdmin();

    // Guard: Require admin credentials only when attempting to view Admin Portal
    if (viewId === 'admin' && !isAdmin) {
      if (window.showToast) {
        window.showToast('🔐 Please log in with Administrator credentials to view the Admin Console.', 'info');
      }
      if (window.Auth) window.Auth.toggleAuthTab('admin');
      viewId = 'auth';
    }

    const target = document.getElementById(`view-${viewId}`);
    if (!target) return;

    // Toggle Navbar between Student Mode and Dedicated Admin Mode
    const studentNav = document.getElementById('studentNavLinks');
    const adminNav = document.getElementById('adminNavLinks');
    const adminBrandBadge = document.getElementById('adminBrandBadge');
    const navBrandSubtitle = document.getElementById('navBrandSubtitle');

    const onAdminOrHome = (viewId === 'admin' || (viewId === 'home' && isAdmin));

    if (onAdminOrHome) {
      if (studentNav) studentNav.style.display = 'none';
      if (adminNav) adminNav.style.display = 'flex';
      if (adminBrandBadge) adminBrandBadge.style.display = 'inline-block';
      if (navBrandSubtitle) navBrandSubtitle.textContent = 'Administrator Management Console';
    } else {
      if (studentNav) studentNav.style.display = 'flex';
      if (adminNav) adminNav.style.display = 'none';
      if (adminBrandBadge) adminBrandBadge.style.display = isAdmin ? 'inline-block' : 'none';
      if (navBrandSubtitle) navBrandSubtitle.textContent = isAdmin ? 'Administrator (Candidate Sandbox)' : 'Skill Gap & Readiness Platform';
      const studentNavAdminReturn = document.getElementById('studentNavAdminReturn');
      if (studentNavAdminReturn) {
        studentNavAdminReturn.style.display = isAdmin ? 'flex' : 'none';
      }
    }

    if (window.Auth && window.Auth.updateHomeContent) {
      window.Auth.updateHomeContent();
    }

    // Deactivate current view
    document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
    target.classList.add('active');

    // Update active state in nav
    document.querySelectorAll('.nav-item').forEach(item => {
      const navTarget = item.getAttribute('data-navigate');
      const adminTabTarget = item.getAttribute('data-admin-tab');

      if (navTarget === viewId || (isAdmin && viewId === 'home' && adminTabTarget === 'home') || (isAdmin && viewId === 'admin' && adminTabTarget === 'all')) {
        item.classList.add('active');
      } else if (navTarget) {
        item.classList.remove('active');
      }
    });

    this.activeView = viewId;
    if (updateHash) {
      window.location.hash = viewId;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger view-specific activations
    if (viewId === 'home') {
      if (isAdmin && window.AdminManager && window.AdminManager.loadOverview) {
        window.AdminManager.loadOverview();
      }
      const g = document.getElementById('homeMetricGap');
      if (g && window.animateCountUp) window.animateCountUp(g, 0, 60, 900, '%');
      const q = document.getElementById('homeMetricQuiz');
      if (q && window.animateCountUp) window.animateCountUp(q, 0, 78, 900, '%');
      const r = document.getElementById('homeMetricRetention');
      if (r && window.animateCountUp) window.animateCountUp(r, 0, 94, 900, '%');
    }
    if (viewId === 'progress' || viewId === 'dashboard') {
      if (window.ProgressManager) {
        window.ProgressManager.loadDashboardData();
      }
    }
    if (viewId === 'quiz') {
      if (window.QuizManager && window.QuizManager.onViewActivated) {
        window.QuizManager.onViewActivated();
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
    const targetKeywords = [
      'careerflow',
      'careercopilot',
      'iamyourcareercopilot',
      'savejobto',
      'savejobtotracker',
      'viewjobtracker',
      'aicoverletter',
      'summarizejobdescription',
      'ailinkedinpost',
      'linkedinoptimization',
      'supersearch',
      'seewhoishiring'
    ];

    const matchesRogue = (str) => {
      if (!str) return false;
      const clean = str.toLowerCase().replace(/[\s\-_]+/g, '');
      return targetKeywords.some(kw => clean.includes(kw));
    };

    // 1. Selector-based suppression and complete DOM removal
    const extensionSelectors = [
      '[id*="careerflow" i]',
      '[class*="careerflow" i]',
      '[data-careerflow]',
      '[id*="copilot" i]:not(#aiChatbotWidget *):not(#aiAnalysisStepperModal *)',
      '[class*="copilot" i]:not(#aiChatbotWidget *):not(#aiAnalysisStepperModal *)',
      'img[alt*="Careerflow" i]',
      'img[alt="hello" i]',
      'img[src*="careerflow" i]',
      '[aria-label*="Careerflow" i]',
      '[data-testid*="careerflow" i]',
      '#careerflow-container',
      '#careerflow-root',
      '#careerflow-sidebar',
      '.careerflow-widget',
      '#careerflow-sidebar-container',
      'careerflow-app',
      'careerflow-root',
      'iframe[src*="careerflow" i]',
      'iframe[id*="careerflow" i]',
      'iframe[class*="careerflow" i]'
    ];

    extensionSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (el.closest('#aiChatbotWidget, #aiAnalysisStepperModal, #adminUserModal, .ai-chat-widget')) {
          return;
        }
        let root = el;
        while (root.parentElement && root.parentElement !== document.body && root.parentElement !== document.documentElement) {
          if (root.parentElement.matches('nav, .view-container, footer, #toastContainer')) {
            break;
          }
          root = root.parentElement;
        }
        root.style.setProperty('display', 'none', 'important');
        root.style.setProperty('visibility', 'hidden', 'important');
        root.style.setProperty('height', '0px', 'important');
        try { root.remove(); } catch (_) {}
      });
    });

    // 2. Direct body children check (remove any unrecognized top-level injected containers)
    if (document.body) {
      Array.from(document.body.children).forEach(child => {
        if (child.matches('nav, .view-container, footer, .toast-container, script, link, style, .ai-chat-widget, #aiAnalysisStepperModal, #adminUserModal, #toastContainer') ||
            child.id === 'aiChatbotWidget' || child.id === 'aiAnalysisStepperModal' || child.id === 'toastContainer' || child.id === 'adminUserModal' || child.classList.contains('ai-chat-widget')) {
          return;
        }
        const text = (child.innerText || child.textContent || '') + ' ' + Array.from(child.querySelectorAll('img')).map(i => (i.alt || '') + ' ' + (i.src || '')).join(' ');
        if (matchesRogue(text) || child.querySelector('img[alt*="Careerflow" i], img[alt="hello" i]')) {
          child.style.setProperty('display', 'none', 'important');
          try { child.remove(); } catch (_) {}
        } else {
          // Any other unrecognized element injected directly into body
          child.style.setProperty('display', 'none', 'important');
          child.style.setProperty('visibility', 'hidden', 'important');
          try { child.remove(); } catch (_) {}
        }
      });
    }

    // 3. Search and destroy rogue text elements anywhere in DOM
    document.querySelectorAll('div, span, p, a, button, section, aside, img').forEach(el => {
      if (el.closest('#aiChatbotWidget, #aiAnalysisStepperModal, #adminUserModal, .ai-chat-widget')) return;
      if (el.tagName === 'IMG') {
        const alt = el.getAttribute('alt') || '';
        const src = el.getAttribute('src') || '';
        if (alt.toLowerCase().includes('careerflow') || alt === 'hello' || src.toLowerCase().includes('careerflow')) {
          let root = el.closest('div:not(.view-container):not(.navbar):not(.app-footer)') || el;
          root.style.setProperty('display', 'none', 'important');
          try { root.remove(); } catch (_) {}
        }
        return;
      }
      const raw = el.innerText || el.textContent || '';
      if (raw && raw.length < 500 && (raw.includes('iAmYourCareerCopilot') || raw.includes('SaveJobtoTracker') || raw.includes('ViewJobTracker') || raw.includes('Careerflow Extension') || raw.includes('SeeWhoIsHiring!'))) {
        let root = el.closest('div:not(.view-container):not(.navbar):not(.app-footer)') || el;
        root.style.setProperty('display', 'none', 'important');
        try { root.remove(); } catch (_) {}
      }
    });
  } catch (e) {
    // Silent fail safe
  }
}

// Set up continuous real-time MutationObserver
try {
  const extensionObserver = new MutationObserver((mutations) => {
    let shouldScan = false;
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length > 0) {
        shouldScan = true;
        break;
      }
    }
    if (shouldScan) {
      suppressInjectedExtensions();
    }
  });

  if (document.documentElement) {
    extensionObserver.observe(document.documentElement, { childList: true, subtree: true });
  }
} catch (_) {}

// Run immediately and periodically
suppressInjectedExtensions();

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  suppressInjectedExtensions();
  setTimeout(suppressInjectedExtensions, 300);
  setTimeout(suppressInjectedExtensions, 1000);
  setTimeout(suppressInjectedExtensions, 2500);
  setInterval(suppressInjectedExtensions, 1500);
});


