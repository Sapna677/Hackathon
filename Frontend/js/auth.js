/**
 * Authentication & User Session Manager
 */
const Auth = {
  currentUser: null,

  init() {
    this.checkSession();
    this.bindEvents();
  },

  checkSession() {
    const savedUser = localStorage.getItem('career_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.updateNavUi();
      } catch (e) {
        this.logout();
      }
    } else {
      this.updateNavUi();
    }
  },

  bindEvents() {
    // Demo Login Button
    const demoBtn = document.getElementById('demoLoginBtn');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => this.handleDemoLogin());
    }

    const demoLoginInline = document.getElementById('demoLoginInlineBtn');
    if (demoLoginInline) {
      demoLoginInline.addEventListener('click', () => this.handleDemoLogin());
    }

    // Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Register Form Submit
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Admin Direct Nav Button
    const navAdminDirect = document.getElementById('navAdminDirectBtn');
    if (navAdminDirect) {
      navAdminDirect.addEventListener('click', () => {
        window.App.navigateTo('auth');
        this.toggleAuthTab('admin');
      });
    }

    // Switch between Login, Register, & Admin tabs
    const tabLogin = document.getElementById('tabAuthLogin');
    const tabRegister = document.getElementById('tabAuthRegister');
    const tabAdmin = document.getElementById('tabAuthAdmin');
    if (tabLogin) tabLogin.addEventListener('click', () => this.toggleAuthTab('login'));
    if (tabRegister) tabRegister.addEventListener('click', () => this.toggleAuthTab('register'));
    if (tabAdmin) tabAdmin.addEventListener('click', () => this.toggleAuthTab('admin'));

    // Admin Form Submit
    const adminForm = document.getElementById('adminLoginForm');
    if (adminForm) {
      adminForm.addEventListener('submit', (e) => this.handleAdminLogin(e));
    }
  },

  toggleAuthTab(tab) {
    const loginBox = document.getElementById('loginCard');
    const regBox = document.getElementById('registerCard');
    const adminBox = document.getElementById('adminLoginCard');
    const tabLogin = document.getElementById('tabAuthLogin');
    const tabRegister = document.getElementById('tabAuthRegister');
    const tabAdmin = document.getElementById('tabAuthAdmin');

    if (loginBox) loginBox.style.display = (tab === 'login') ? 'block' : 'none';
    if (regBox) regBox.style.display = (tab === 'register') ? 'block' : 'none';
    if (adminBox) adminBox.style.display = (tab === 'admin') ? 'block' : 'none';

    if (tabLogin) tabLogin.classList.toggle('active', tab === 'login');
    if (tabRegister) tabRegister.classList.toggle('active', tab === 'register');
    if (tabAdmin) tabAdmin.classList.toggle('active', tab === 'admin');
  },

  async handleDemoLogin() {
    try {
      showToast('Logging in as Demo Student...', 'info');
      const res = await window.api.demoLogin();
      this.saveSession(res.token, res.user);
      showToast('Welcome, ' + res.user.name + '!', 'success');
      window.App.navigateTo('dashboard');
    } catch (err) {
      // Offline fallback demo session
      const fallbackUser = {
        name: 'Priya Sharma (Demo Student)',
        email: 'priya.demo@careerready.ai',
        role: 'College Fresher / Job Seeker'
      };
      this.saveSession('offline_demo_token', fallbackUser);
      showToast('Welcome, ' + fallbackUser.name + ' (Local Demo Mode)!', 'success');
      window.App.navigateTo('dashboard');
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;

    try {
      const res = await window.api.login(email, pass);
      this.saveSession(res.token, res.user);
      showToast('Login successful!', 'success');
      window.App.navigateTo('dashboard');
    } catch (err) {
      showToast(err.message || 'Login failed. Check your credentials.', 'error');
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    try {
      const res = await window.api.register(name, email, password, role);
      this.saveSession(res.token, res.user);
      showToast('Account created successfully!', 'success');
      window.App.navigateTo('dashboard');
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
    }
  },

  async handleAdminLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = (document.getElementById('adminEmail')?.value || 'admin@careerready.ai').trim();
    const password = document.getElementById('adminPassword')?.value || 'admin123';

    try {
      showToast('Verifying Administrator credentials...', 'info');
      const res = await window.api.adminLogin(email, password);
      this.saveSession(res.token, res.user);
      showToast('🛡️ Welcome, System Administrator! Redirecting to Admin Portal...', 'success');
      setTimeout(() => {
        window.App.navigateTo('admin');
      }, 400);
    } catch (err) {
      showToast(err.message || 'Admin login failed. Verify email & password.', 'error');
    }
  },

  async handleInstantAdminLogin() {
    try {
      showToast('Initiating 1-Click Instant Admin Access...', 'info');
      const res = await window.api.adminLogin('admin@careerready.ai', 'admin123');
      this.saveSession(res.token, res.user);
      showToast('🛡️ Admin Authorized! Welcome to Admin Portal.', 'success');
      setTimeout(() => {
        window.App.navigateTo('admin');
      }, 300);
    } catch (err) {
      // Offline fallback
      const adminFallback = {
        id: 'admin_sys_001',
        name: 'System Administrator',
        email: 'admin@careerready.ai',
        role: 'Administrator',
        userRole: 'Administrator',
        isAdmin: true
      };
      this.saveSession('offline_admin_token', adminFallback);
      showToast('🛡️ Offline Admin Authorized! Loading Admin Portal...', 'success');
      setTimeout(() => {
        window.App.navigateTo('admin');
      }, 300);
    }
  },

  saveSession(token, user) {
    this.currentUser = user;
    window.api.setToken(token);
    localStorage.setItem('career_user', JSON.stringify(user));
    this.updateNavUi();
  },

  logout() {
    this.currentUser = null;
    window.api.setToken(null);
    localStorage.removeItem('career_user');
    this.updateNavUi();
    showToast('Logged out successfully.', 'info');
    window.App.navigateTo('home');
  },

  isAdmin() {
    if (!this.currentUser) return false;
    return (
      this.currentUser.role === 'Administrator' ||
      this.currentUser.userRole === 'Administrator' ||
      this.currentUser.isAdmin === true ||
      this.currentUser.email === 'admin@careerready.ai'
    );
  },

  updateNavUi() {
    const userDisplay = document.getElementById('userProfileDisplay');
    const guestDisplay = document.getElementById('guestAuthControls');
    const userNameLabel = document.getElementById('navUserName');
    const userPill = userDisplay ? userDisplay.querySelector('div') : null;

    const studentNav = document.getElementById('studentNavLinks');
    const adminNav = document.getElementById('adminNavLinks');
    const adminBrandBadge = document.getElementById('adminBrandBadge');
    const navBrandSubtitle = document.getElementById('navBrandSubtitle');

    const adminActive = this.isAdmin();

    if (adminActive) {
      if (studentNav) studentNav.style.display = 'none';
      if (adminNav) adminNav.style.display = 'flex';
      if (adminBrandBadge) adminBrandBadge.style.display = 'inline-block';
      if (navBrandSubtitle) navBrandSubtitle.textContent = 'Administrator Management Console';
    } else {
      if (window.App && window.App.activeView === 'admin') {
        if (studentNav) studentNav.style.display = 'none';
        if (adminNav) adminNav.style.display = 'flex';
      } else {
        if (studentNav) studentNav.style.display = 'flex';
        if (adminNav) adminNav.style.display = 'none';
        if (adminBrandBadge) adminBrandBadge.style.display = 'none';
        if (navBrandSubtitle) navBrandSubtitle.textContent = 'Skill Gap & Readiness Platform';
      }
    }

    if (this.currentUser) {
      if (userDisplay) userDisplay.style.display = 'flex';
      if (guestDisplay) guestDisplay.style.display = 'none';

      if (userNameLabel) {
        if (adminActive) {
          userNameLabel.innerHTML = '🛡️ Admin <span style="font-weight: 500; font-size: 0.78rem; opacity: 0.85;">(System)</span>';
          if (userPill) {
            userPill.style.background = '#ede9fe';
            userPill.style.color = '#4338ca';
            userPill.style.border = '1px solid #c4b5fd';
            userPill.style.cursor = 'pointer';
            userPill.title = 'Click to view Administrator Console';
            userPill.onclick = () => window.App.navigateTo('admin');
          }
        } else {
          userNameLabel.textContent = this.currentUser.name;
          if (userPill) {
            userPill.style.background = 'var(--primary-light)';
            userPill.style.color = 'var(--primary)';
            userPill.style.border = 'none';
            userPill.style.cursor = 'default';
            userPill.onclick = null;
          }
        }
      }
    } else {
      if (userDisplay) userDisplay.style.display = 'none';
      if (guestDisplay) guestDisplay.style.display = 'flex';
    }
  }
};

window.Auth = Auth;
