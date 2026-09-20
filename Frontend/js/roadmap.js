/**
 * Personalized Learning Roadmap Module
 */
const RoadmapManager = {
  currentRoadmap: null,

  init() {
    this.bindEvents();
    const saved = localStorage.getItem('career_current_roadmap');
    if (saved) {
      try {
        this.currentRoadmap = JSON.parse(saved);
        this.renderRoadmap(this.currentRoadmap);
      } catch (e) {}
    }
  },

  bindEvents() {
    // any global roadmap listeners
  },

  async generateFromAnalysis(analysis) {
    try {
      showToast('Generating personalized weekly curriculum...', 'info');
      const payload = {
        analysisId: analysis.id,
        missingSkills: analysis.missingSkills,
        weakSkills: analysis.weakSkills,
        targetRole: analysis.jobTitle
      };

      const res = await window.api.generateRoadmap(payload);
      this.currentRoadmap = res.roadmap;
      localStorage.setItem('career_current_roadmap', JSON.stringify(res.roadmap));
      this.renderRoadmap(res.roadmap);
      showToast('Learning roadmap ready!', 'success');
    } catch (err) {
      console.warn('Backend roadmap failed, generating client curriculum:', err.message);
      const skills = (analysis.missingSkills || []).map(s => s.name);
      const focus1 = skills.slice(0, 2).join(' & ') || 'Core Fundamentals';
      const focus2 = skills.slice(2, 4).join(' & ') || 'API & Framework Building';

      const fallbackRoadmap = {
        id: 'local_roadmap_' + Date.now(),
        targetRole: analysis.jobTitle || 'Full Stack Developer',
        progressPercentage: 0,
        completedTasksCount: 0,
        totalTasksCount: 9,
        weeks: [
          {
            weekNumber: 1,
            title: 'Week 1: Core Fundamentals & Setup',
            duration: '7 Days',
            focus: focus1,
            objectives: [
              `Master core paradigms of ${focus1}.`,
              'Set up development environment and build basic syntax prototypes.'
            ],
            tasks: [
              { id: 't1_1', text: `Read official documentation and setup guides for ${focus1}`, completed: false },
              { id: 't1_2', text: 'Solve 10 practical algorithmic coding exercises', completed: false },
              { id: 't1_3', text: 'Initialize Git repo and build starter prototype', completed: false }
            ],
            resources: [
              { skill: focus1, docsUrl: 'https://developer.mozilla.org', courseUrl: 'https://www.freecodecamp.org' }
            ],
            projectMilestone: `Console or Starter Prototype implementing ${focus1}.`
          },
          {
            weekNumber: 2,
            title: 'Week 2: Frameworks & Real-World Integration',
            duration: '7 Days',
            focus: focus2,
            objectives: [
              `Implement full CRUD application using ${focus2}.`,
              'Integrate asynchronous APIs and persistent databases.'
            ],
            tasks: [
              { id: 't2_1', text: `Build REST API endpoints or user interfaces with ${focus2}`, completed: false },
              { id: 't2_2', text: 'Implement robust error handling and form validation', completed: false },
              { id: 't2_3', text: 'Connect application state and database models', completed: false }
            ],
            resources: [
              { skill: focus2, docsUrl: 'https://roadmap.sh', courseUrl: 'https://www.freecodecamp.org' }
            ],
            projectMilestone: 'Full-Stack Functional Prototype with database storage.'
          },
          {
            weekNumber: 3,
            title: 'Week 3: Testing, Containers & Deployment',
            duration: '7 Days',
            focus: 'Docker, CI/CD & Automated Tests',
            objectives: [
              'Write automated unit and integration tests.',
              'Containerize app with Docker and deploy to cloud.'
            ],
            tasks: [
              { id: 't3_1', text: 'Write unit tests for business logic functions', completed: false },
              { id: 't3_2', text: 'Create Dockerfile and test local container build', completed: false },
              { id: 't3_3', text: 'Deploy to Render / Railway / Vercel with live URL', completed: false }
            ],
            resources: [
              { skill: 'Docker & Testing', docsUrl: 'https://docs.docker.com', courseUrl: 'https://www.freecodecamp.org' }
            ],
            projectMilestone: 'Deployed Cloud Application with automated GitHub CI build checks.'
          },
          {
            weekNumber: 4,
            title: 'Week 4: Capstone Project & Interview Simulation',
            duration: '7 Days',
            focus: 'Portfolio Showcase & Technical MCQs',
            objectives: [
              'Polish complete portfolio capstone project.',
              'Practice technical interview questions and system design.'
            ],
            tasks: [
              { id: 't4_1', text: 'Write comprehensive README with architecture diagram', completed: false },
              { id: 't4_2', text: 'Solve 20 mock interview MCQs on target skills', completed: false },
              { id: 't4_3', text: 'Conduct mock peer technical interview', completed: false }
            ],
            resources: [
              { skill: 'Interview Prep', docsUrl: 'https://leetcode.com', courseUrl: 'https://github.com/jwasham/coding-interview-university' }
            ],
            projectMilestone: `Production-grade Portfolio Showcase Project ready for job applications.`
          }
        ]
      };

      this.currentRoadmap = fallbackRoadmap;
      localStorage.setItem('career_current_roadmap', JSON.stringify(fallbackRoadmap));
      this.renderRoadmap(fallbackRoadmap);
      showToast('Learning roadmap generated in browser!', 'success');
    }
  },

  renderRoadmap(roadmap) {
    const container = document.getElementById('roadmapWeeksContainer');
    if (!container) return;

    // Update overall stats
    document.getElementById('roadmapRoleTitle').textContent = roadmap.targetRole || 'Software Career';
    document.getElementById('roadmapProgressPercent').textContent = `${roadmap.progressPercentage || 0}% Complete`;
    const progressBar = document.getElementById('roadmapOverallProgressBar');
    if (progressBar) {
      progressBar.style.width = `${roadmap.progressPercentage || 0}%`;
    }

    container.innerHTML = '';

    roadmap.weeks.forEach(week => {
      const weekCard = document.createElement('div');
      weekCard.className = 'card';
      weekCard.style.borderLeft = '5px solid var(--primary)';
      weekCard.style.marginBottom = '1.5rem';

      const tasksHtml = week.tasks.map(task => `
        <label style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.6rem; cursor:pointer; font-size:0.92rem;">
          <input type="checkbox" data-task-id="${task.id}" ${task.completed ? 'checked' : ''} style="width:18px; height:18px; accent-color:var(--primary);">
          <span style="${task.completed ? 'text-decoration: line-through; opacity:0.6;' : ''}">${task.text}</span>
        </label>
      `).join('');

      const resourcesHtml = week.resources.map(r => `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:0.75rem; margin-top:0.5rem; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="font-weight:700; font-size:0.85rem; color:#1e293b;">📘 ${r.skill} Resources</span>
          </div>
          <div style="display:flex; gap:0.5rem;">
            ${r.docsUrl ? `<a href="${r.docsUrl}" target="_blank" class="btn btn-secondary btn-sm" style="font-size:0.75rem;">Docs ↗</a>` : ''}
            ${r.courseUrl ? `<a href="${r.courseUrl}" target="_blank" class="btn btn-primary btn-sm" style="font-size:0.75rem;">Tutorial ↗</a>` : ''}
          </div>
        </div>
      `).join('');

      weekCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <div>
            <span class="badge badge-tech" style="margin-bottom:0.3rem;">Week ${week.weekNumber} (${week.duration})</span>
            <h3 style="font-size:1.2rem; font-weight:700; color:var(--dark-bg);">${week.title}</h3>
          </div>
          <span class="badge" style="background:var(--primary-light); color:var(--primary);">Focus: ${week.focus}</span>
        </div>

        <div style="margin-bottom:1rem;">
          <h4 style="font-size:0.9rem; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); margin-bottom:0.4rem;">🎯 Weekly Objectives:</h4>
          <ul style="padding-left:1.2rem; font-size:0.9rem; color:#475569;">
            ${week.objectives.map(o => `<li>${o}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom:1rem; background:#f1f5f9; padding:1rem; border-radius:12px;">
          <h4 style="font-size:0.9rem; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); margin-bottom:0.6rem;">✅ Action Items Checklist:</h4>
          <div class="tasks-wrapper">${tasksHtml}</div>
        </div>

        <div style="margin-bottom:1rem;">
          <h4 style="font-size:0.9rem; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); margin-bottom:0.4rem;">🔗 Curated Free Study Materials:</h4>
          ${resourcesHtml}
        </div>

        <div style="border-top:1px dashed #cbd5e1; padding-top:0.75rem; margin-top:0.75rem; font-size:0.88rem; color:#047857; font-weight:600;">
          🚀 Milestone Project: ${week.projectMilestone}
        </div>
      `;

      // Attach task checkbox click handler
      weekCard.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', async (e) => {
          const taskId = e.target.getAttribute('data-task-id');
          await this.toggleTask(taskId, e.target.checked);
        });
      });

      container.appendChild(weekCard);
    });
  },

  async toggleTask(taskId, isChecked) {
    if (!this.currentRoadmap) return;

    try {
      const res = await window.api.toggleRoadmapTask(this.currentRoadmap.id, taskId);
      this.currentRoadmap = res.roadmap;
      localStorage.setItem('career_current_roadmap', JSON.stringify(res.roadmap));
      
      // Update UI bar
      document.getElementById('roadmapProgressPercent').textContent = `${res.roadmap.progressPercentage}% Complete`;
      const progressBar = document.getElementById('roadmapOverallProgressBar');
      if (progressBar) progressBar.style.width = `${res.roadmap.progressPercentage}%`;

      showToast(`Task marked as ${isChecked ? 'completed' : 'pending'}!`, 'success');
    } catch (err) {
      console.warn('Error updating task:', err);
    }
  }
};

window.RoadmapManager = RoadmapManager;
