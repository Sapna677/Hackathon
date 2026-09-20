/**
 * AI Skill Gap Analysis Module
 */
const GapManager = {
  currentAnalysis: null,

  init() {
    this.bindEvents();
    const saved = localStorage.getItem('career_current_analysis');
    if (saved) {
      try {
        this.currentAnalysis = JSON.parse(saved);
        this.renderAnalysis(this.currentAnalysis);
      } catch (e) {}
    }
  },

  bindEvents() {
    const runGapBtn = document.getElementById('runSkillGapBtn');
    if (runGapBtn) {
      runGapBtn.addEventListener('click', () => this.runAnalysis());
    }

    const runGapFromJdBtn = document.getElementById('runGapFromJdBtn');
    if (runGapFromJdBtn) {
      runGapFromJdBtn.addEventListener('click', () => {
        window.App.navigateTo('analysis');
        this.runAnalysis();
      });
    }

    const genRoadmapBtn = document.getElementById('triggerGenRoadmapBtn');
    if (genRoadmapBtn) {
      genRoadmapBtn.addEventListener('click', () => {
        if (!this.currentAnalysis) {
          showToast('Run skill gap analysis first!', 'error');
          return;
        }
        window.RoadmapManager.generateFromAnalysis(this.currentAnalysis);
      });
    }

    const startQuizBtn = document.getElementById('triggerQuizFromGapBtn');
    if (startQuizBtn) {
      startQuizBtn.addEventListener('click', () => {
        if (!this.currentAnalysis) {
          showToast('Run skill gap analysis first!', 'error');
          return;
        }
        const skillsToTest = [
          ...this.currentAnalysis.missingSkills.map(s => s.name),
          ...this.currentAnalysis.weakSkills.map(s => s.name)
        ];
        window.QuizManager.startAssessment(skillsToTest);
      });
    }
  },

  async runAnalysis() {
    let resume = window.ResumeManager.currentResume;
    let jd = window.JdManager.currentJd;

    // Check localStorage if not in memory
    if (!resume) {
      const savedResume = localStorage.getItem('career_current_resume');
      if (savedResume) resume = JSON.parse(savedResume);
    }
    if (!jd) {
      const savedJd = localStorage.getItem('career_current_jd');
      if (savedJd) jd = JSON.parse(savedJd);
    }

    if (!resume) {
      showToast('Please upload or select a Resume first!', 'error');
      window.App.navigateTo('resume');
      return;
    }

    if (!jd) {
      showToast('Please select or paste a Job Description first!', 'error');
      window.App.navigateTo('jd');
      return;
    }

    try {
      showToast('AI Gap Engine analyzing resume against job description...', 'info');
      const payload = {
        resumeId: resume.id,
        jdId: jd.id,
        resumeSkills: resume.skills,
        jdSkills: jd.detectedSkills,
        jobTitle: jd.jobTitle
      };

      const res = await window.api.analyzeGap(payload);
      this.currentAnalysis = res.analysis;
      localStorage.setItem('career_current_analysis', JSON.stringify(res.analysis));
      this.renderAnalysis(res.analysis);
      showToast('Skill gap analysis generated!', 'success');

      // Automatically generate learning roadmap
      window.RoadmapManager.generateFromAnalysis(res.analysis);
    } catch (err) {
      console.warn('Backend gap analysis error, using browser engine:', err.message);
      const rSkills = (resume.skills || []).map(s => s.name.toLowerCase());
      const jSkills = (jd.detectedSkills || []);

      const matched = [];
      const missing = [];
      const weak = [];

      jSkills.forEach(js => {
        if (rSkills.includes(js.name.toLowerCase())) {
          matched.push({ name: js.name, category: 'matched', status: 'matched' });
        } else {
          missing.push({ name: js.name, category: 'missing', status: 'missing' });
        }
      });

      const total = jSkills.length || 1;
      const score = Math.min(100, Math.round((matched.length / total) * 100));

      const fallbackAnalysis = {
        id: 'local_gap_' + Date.now(),
        jobTitle: jd.jobTitle,
        readinessScore: score,
        readinessLevel: score >= 75 ? 'Job Ready' : score >= 50 ? 'Near Ready' : 'Needs Upskilling',
        estimatedTimeToReadiness: score >= 75 ? '1 - 2 Weeks' : score >= 50 ? '3 - 4 Weeks' : '6 - 8 Weeks',
        matchedSkills: matched,
        missingSkills: missing,
        weakSkills: weak,
        recommendations: [
          `Focus on learning missing core skills: ${missing.slice(0, 3).map(s => s.name).join(', ') || 'Frameworks'}.`,
          `Highlight strong matching skills: ${matched.slice(0, 3).map(m => m.name).join(', ') || 'Basics'} on top of your resume.`
        ]
      };

      this.currentAnalysis = fallbackAnalysis;
      localStorage.setItem('career_current_analysis', JSON.stringify(fallbackAnalysis));
      this.renderAnalysis(fallbackAnalysis);
      showToast('Skill gap calculated in browser!', 'success');
      window.RoadmapManager.generateFromAnalysis(fallbackAnalysis);
    }
  },

  renderAnalysis(analysis) {
    const container = document.getElementById('gapAnalysisResultContainer');
    if (!container) return;

    container.style.display = 'block';

    // Update gauge and score
    const scoreVal = document.getElementById('readinessScoreValue');
    if (scoreVal) scoreVal.textContent = `${analysis.readinessScore}%`;

    const gaugeFill = document.getElementById('readinessGaugeCircle');
    if (gaugeFill) {
      // Circumference = 2 * PI * r = 2 * 3.14159 * 70 = ~440
      const offset = 440 - (440 * analysis.readinessScore) / 100;
      gaugeFill.style.strokeDashoffset = offset;
      if (analysis.readinessScore >= 75) {
        gaugeFill.style.stroke = '#10b981';
      } else if (analysis.readinessScore >= 50) {
        gaugeFill.style.stroke = '#4f46e5';
      } else {
        gaugeFill.style.stroke = '#f59e0b';
      }
    }

    document.getElementById('readinessLevelBadge').textContent = analysis.readinessLevel;
    document.getElementById('timeToReadinessValue').textContent = analysis.estimatedTimeToReadiness;

    // Matched skills
    const matchedContainer = document.getElementById('matchedSkillsList');
    if (matchedContainer) {
      matchedContainer.innerHTML = '';
      if (analysis.matchedSkills.length === 0) {
        matchedContainer.innerHTML = '<span class="text-muted" style="font-size:0.85rem;">No direct matching skills detected.</span>';
      } else {
        analysis.matchedSkills.forEach(s => {
          const badge = document.createElement('span');
          badge.className = 'badge badge-matched';
          badge.innerHTML = `✓ ${s.name}`;
          matchedContainer.appendChild(badge);
        });
      }
    }

    // Missing skills
    const missingContainer = document.getElementById('missingSkillsList');
    if (missingContainer) {
      missingContainer.innerHTML = '';
      if (analysis.missingSkills.length === 0) {
        missingContainer.innerHTML = '<span class="text-muted" style="font-size:0.85rem;">None! All core required skills matched!</span>';
      } else {
        analysis.missingSkills.forEach(s => {
          const badge = document.createElement('span');
          badge.className = 'badge badge-missing';
          badge.innerHTML = `✗ ${s.name}`;
          missingContainer.appendChild(badge);
        });
      }
    }

    // Weak skills
    const weakContainer = document.getElementById('weakSkillsList');
    if (weakContainer) {
      weakContainer.innerHTML = '';
      if (analysis.weakSkills.length === 0) {
        weakContainer.innerHTML = '<span class="text-muted" style="font-size:0.85rem;">No weak skills flagged.</span>';
      } else {
        analysis.weakSkills.forEach(s => {
          const badge = document.createElement('span');
          badge.className = 'badge badge-weak';
          badge.innerHTML = `⚠ ${s.name}`;
          weakContainer.appendChild(badge);
        });
      }
    }

    // Recommendations
    const recoList = document.getElementById('aiRecommendationsList');
    if (recoList && analysis.recommendations) {
      recoList.innerHTML = '';
      analysis.recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.style.marginBottom = '0.5rem';
        li.style.fontSize = '0.92rem';
        li.innerHTML = `💡 ${rec}`;
        recoList.appendChild(li);
      });
    }

    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

window.GapManager = GapManager;
