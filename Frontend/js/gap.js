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

  async playAnalysisStepper() {
    const modal = document.getElementById('aiAnalysisStepperModal');
    if (!modal) return;

    modal.style.display = 'flex';

    const steps = [
      { id: 1, text: 'Analyzing Profile & Experience Criteria...', pct: 20 },
      { id: 2, text: 'Comparing Options against Job Requirements...', pct: 45 },
      { id: 3, text: 'Evaluating Critical Factors & Missing Gaps...', pct: 70 },
      { id: 4, text: 'Calculating Readiness Score & Milestones...', pct: 90 },
      { id: 5, text: 'Finalizing Strategic Decision Report...', pct: 100 }
    ];

    // Reset all steps to pending
    for (let i = 1; i <= 5; i++) {
      const stepEl = document.getElementById(`stepperStep${i}`);
      const indEl = document.getElementById(`stepperIndicator${i}`);
      if (stepEl) stepEl.className = 'stepper-step-item pending';
      if (indEl) indEl.innerHTML = `${i}`;
    }

    const statusText = document.getElementById('stepperStatusText');
    const progressBar = document.getElementById('stepperProgressBar');
    const progressPct = document.getElementById('stepperProgressPercent');

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepEl = document.getElementById(`stepperStep${step.id}`);
      const indEl = document.getElementById(`stepperIndicator${step.id}`);

      // Set active with spinner
      if (stepEl) stepEl.className = 'stepper-step-item active';
      if (indEl) indEl.innerHTML = '<span class="step-spinner"></span>';
      if (statusText) statusText.textContent = step.text;
      if (progressBar) progressBar.style.width = `${step.pct}%`;
      if (progressPct) progressPct.textContent = `${step.pct}%`;

      // Wait for smooth SaaS stepper cadence
      await new Promise(r => setTimeout(r, 420));

      // Mark completed with checkmark
      if (stepEl) stepEl.className = 'stepper-step-item completed';
      if (indEl) indEl.innerHTML = '✓';
    }

    if (statusText) statusText.textContent = 'Analysis Complete! Rendering Diagnostics...';
    await new Promise(r => setTimeout(r, 350));

    modal.style.display = 'none';
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

    const payload = {
      resumeId: resume.id,
      jdId: jd.id,
      resumeSkills: resume.skills,
      jdSkills: jd.detectedSkills,
      jobTitle: jd.jobTitle
    };

    // Trigger API call concurrently with stepper animation
    const apiPromise = (async () => {
      try {
        const res = await window.api.analyzeGap(payload);
        return { success: true, analysis: res.analysis };
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
        return { success: false, analysis: fallbackAnalysis };
      }
    })();

    // Play impressive sequential multi-step analysis animation
    await this.playAnalysisStepper();

    const result = await apiPromise;
    this.currentAnalysis = result.analysis;
    localStorage.setItem('career_current_analysis', JSON.stringify(result.analysis));
    this.renderAnalysis(result.analysis);
    showToast(result.success ? 'Skill gap analysis generated!' : 'Skill gap calculated in browser!', 'success');
    window.RoadmapManager.generateFromAnalysis(result.analysis);
  },

  renderAnalysis(analysis) {
    const container = document.getElementById('gapAnalysisResultContainer');
    if (!container) return;

    container.style.display = 'block';

    // Update gauge and score with smooth count-up animation
    const scoreVal = document.getElementById('readinessScoreValue');
    const targetScore = analysis.readinessScore || 0;
    if (scoreVal) {
      if (window.animateCountUp) {
        window.animateCountUp(scoreVal, 0, targetScore, 1000, '%');
      } else {
        scoreVal.textContent = `${targetScore}%`;
      }
    }

    const gaugeFill = document.getElementById('readinessGaugeCircle');
    if (gaugeFill) {
      // Circumference = 2 * PI * r = 2 * 3.14159 * 70 = ~440
      gaugeFill.style.strokeDashoffset = '440';
      setTimeout(() => {
        const offset = 440 - (440 * targetScore) / 100;
        gaugeFill.style.strokeDashoffset = offset;
        if (targetScore >= 75) {
          gaugeFill.style.stroke = '#10b981';
        } else if (targetScore >= 50) {
          gaugeFill.style.stroke = '#4f46e5';
        } else {
          gaugeFill.style.stroke = '#f59e0b';
        }
      }, 50);
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
