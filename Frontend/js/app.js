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
    if (viewId === 'home' && isAdmin) {
      if (window.AdminManager && window.AdminManager.loadOverview) {
        window.AdminManager.loadOverview();
      }
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

