/**
 * Job Description (JD) Analyzer Module
 */
const JdManager = {
  currentJd: null,
  predefinedRoles: [],

  init() {
    this.loadRoles();
    this.bindEvents();
  },

  DEFAULT_ROLES: [
    {
      id: 'fullstack-dev',
      title: 'Full Stack Web Developer',
      level: 'Entry / Junior',
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'RESTful APIs', 'Git', 'HTML5', 'CSS3'],
      description: 'Looking for a passionate Full Stack Developer to build modern responsive web applications using the MERN stack.'
    },
    {
      id: 'frontend-dev',
      title: 'Frontend React Developer',
      level: 'Entry / Mid',
      requiredSkills: ['JavaScript', 'TypeScript', 'React', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux', 'Git'],
      description: 'Seeking a creative Frontend Developer proficient in React.js, TypeScript, and modern CSS frameworks like Tailwind CSS.'
    },
    {
      id: 'backend-dev',
      title: 'Backend Node.js & Java Engineer',
      level: 'Entry / Junior',
      requiredSkills: ['Node.js', 'Express.js', 'Java', 'Spring Boot', 'RESTful APIs', 'PostgreSQL', 'MongoDB', 'Git'],
      description: 'Join our engineering team to build scalable microservices and RESTful APIs using Node.js or Java Spring Boot.'
    },
    {
      id: 'data-ai-engineer',
      title: 'AI & Data Science Specialist',
      level: 'Entry / Junior',
      requiredSkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Machine Learning', 'Git'],
      description: 'Exciting opportunity for a Data & AI Engineer to extract insights and build predictive machine learning models.'
    },
    {
      id: 'devops-cloud-engineer',
      title: 'DevOps & Cloud Engineer',
      level: 'Entry / Junior',
      requiredSkills: ['Linux', 'Git', 'Docker', 'Kubernetes', 'CI/CD', 'AWS'],
      description: 'DevOps Engineer to manage cloud infrastructure, automate deployment pipelines with CI/CD and Docker.'
    }
  ],

  async loadRoles() {
    // Render defaults immediately
    this.predefinedRoles = this.DEFAULT_ROLES;
    this.renderRoleSelector(this.DEFAULT_ROLES);

    try {
      const res = await window.api.getJobRoles();
      if (res.roles && res.roles.length > 0) {
        this.predefinedRoles = res.roles;
        this.renderRoleSelector(res.roles);
      }
    } catch (err) {
      console.warn('Backend roles fetch, using local defaults:', err.message);
    }
  },

  renderRoleSelector(roles) {
    const container = document.getElementById('roleCardsContainer');
    if (!container) return;

    container.innerHTML = '';
    roles.forEach(role => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.cursor = 'pointer';
      card.style.transition = 'all 0.2s';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.75rem;">
          <h3 style="font-size:1.1rem; font-weight:700; color:var(--dark-bg);">${role.title}</h3>
          <span class="badge badge-tech">${role.level}</span>
        </div>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">${role.description}</p>
        <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
          ${role.requiredSkills.map(s => `<span class="badge badge-tech" style="font-size:0.75rem;">${s}</span>`).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" style="margin-top:1rem; width:100%;">Select This Role 🎯</button>
      `;

      card.addEventListener('click', () => {
        this.selectRole(role);
      });

      container.appendChild(card);
    });
  },

  async selectRole(role) {
    showToast(`Selected: ${role.title}`, 'info');
    document.getElementById('customJdText').value = role.description + '\n\nRequired Skills: ' + role.requiredSkills.join(', ');
    document.getElementById('customJobTitle').value = role.title;
    await this.handleAnalyzeJd({ roleId: role.id });
    window.App.navigateTo('analysis');
    window.GapManager.runAnalysis();
  },

  bindEvents() {
    const analyzeBtn = document.getElementById('analyzeJdBtn');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', async () => {
        const text = document.getElementById('customJdText').value.trim();
        const title = document.getElementById('customJobTitle').value.trim() || 'Target Position';
        if (!text) {
          showToast('Please paste a Job Description or select a role above.', 'error');
          return;
        }
        await this.handleAnalyzeJd({ customJdText: text, jobTitle: title });
        window.App.navigateTo('analysis');
        window.GapManager.runAnalysis();
      });
    }
  },

  async handleAnalyzeJd(payload) {
    try {
      showToast('Extracting job role requirements & skills...', 'info');
      const res = await window.api.analyzeJobDescription(payload);
      this.currentJd = res.jobDescription;
      localStorage.setItem('career_current_jd', JSON.stringify(res.jobDescription));
      this.renderJdPreview(res.jobDescription);
      showToast('Job Description analyzed successfully!', 'success');
    } catch (err) {
      console.warn('Backend JD analyze failed, using local extraction:', err.message);
      // Client-side extraction fallback
      let title = payload.jobTitle || 'Target Role';
      let text = payload.customJdText || '';
      let skills = [];

      if (payload.roleId) {
        const found = this.DEFAULT_ROLES.find(r => r.id === payload.roleId);
        if (found) {
          title = found.title;
          skills = found.requiredSkills.map(s => ({ name: s, category: 'backend' }));
        }
      } else {
        const sampleTaxonomy = ['JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'Express.js', 'Spring Boot', 'MongoDB', 'PostgreSQL', 'SQL', 'Docker', 'Kubernetes', 'Git', 'AWS', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux', 'RESTful APIs', 'Machine Learning'];
        sampleTaxonomy.forEach(s => {
          if (text.toLowerCase().includes(s.toLowerCase())) {
            skills.push({ name: s, category: 'technical' });
          }
        });
      }

      const fallbackJd = {
        id: 'local_jd_' + Date.now(),
        jobTitle: title,
        detectedSkills: skills,
        skillsCount: skills.length
      };

      this.currentJd = fallbackJd;
      localStorage.setItem('career_current_jd', JSON.stringify(fallbackJd));
      this.renderJdPreview(fallbackJd);
      showToast('Job requirements analyzed in browser!', 'success');
    }
  },

  renderJdPreview(jd) {
    const preview = document.getElementById('jdParsedPreview');
    if (!preview) return;

    preview.style.display = 'block';
    document.getElementById('jdRoleTitlePreview').textContent = jd.jobTitle;

    const skillsContainer = document.getElementById('jdSkillsPreview');
    if (skillsContainer) {
      skillsContainer.innerHTML = '';
      if (jd.detectedSkills && jd.detectedSkills.length > 0) {
        jd.detectedSkills.forEach(skill => {
          const badge = document.createElement('span');
          badge.className = 'badge badge-tech';
          badge.textContent = `★ ${skill.name}`;
          skillsContainer.appendChild(badge);
        });
      }
    }

    // Scroll to preview
    preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

window.JdManager = JdManager;
