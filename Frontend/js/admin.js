/**
 * Admin Portal Management Controller
 * Handles Platform Analytics, User Progress Monitoring & Cohort Insights
 */

const AdminManager = {
  allUsers: [],
  filteredUsers: [],
  selectedUserDossier: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('adminUserSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterUsers();
      });
    }

    // Role filter
    const roleFilter = document.getElementById('adminRoleFilter');
    if (roleFilter) {
      roleFilter.addEventListener('change', () => {
        this.filterUsers();
      });
    }

    // Sort filter
    const sortFilter = document.getElementById('adminSortFilter');
    if (sortFilter) {
      sortFilter.addEventListener('change', () => {
        this.filterUsers();
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById('adminRefreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadAllAdminData(true);
      });
    }

    // Modal Close
    const closeModalBtn = document.getElementById('closeAdminModalBtn');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // Click outside modal to close
    const modalBackdrop = document.getElementById('adminUserModal');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
          this.closeModal();
        }
      });
    }
  },

  async loadAllAdminData(showNotice = false) {
    if (showNotice && window.showToast) {
      window.showToast('Refreshing Admin Analytics...', 'info');
    }

    await Promise.all([
      this.loadOverview(),
      this.loadUsers()
    ]);

    if (showNotice && window.showToast) {
      window.showToast('Admin Portal data updated!', 'success');
    }
  },

  async loadOverview() {
    try {
      const res = await window.ApiClient.get('/admin/overview');
      if (res && res.success && res.data) {
        this.renderOverview(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    }
  },

  renderOverview(data) {
    const summary = data.summary || {};
    const roleBreakdown = data.roleBreakdown || {};
    const topGaps = data.topSkillGaps || [];
    const topDemands = data.topDemandSkills || [];

    // Summary Cards
    const totalUsersEl = document.getElementById('adminTotalUsers');
    if (totalUsersEl) totalUsersEl.textContent = summary.totalUsers || 0;

    const avgReadinessEl = document.getElementById('adminAvgReadiness');
    if (avgReadinessEl) avgReadinessEl.textContent = `${summary.avgReadinessScore || 0}%`;

    const totalQuizzesEl = document.getElementById('adminTotalQuizzes');
    if (totalQuizzesEl) totalQuizzesEl.textContent = summary.totalQuizzesTaken || 0;

    const avgQuizEl = document.getElementById('adminAvgQuizAcc');
    if (avgQuizEl) avgQuizEl.textContent = summary.avgQuizAccuracy || '0%';

    const totalRoadmapsEl = document.getElementById('adminTotalRoadmaps');
    if (totalRoadmapsEl) totalRoadmapsEl.textContent = summary.totalRoadmapsGenerated || 0;

    // Role Breakdown Badges / Counts
    const rolesContainer = document.getElementById('adminRoleBreakdown');
    if (rolesContainer) {
      rolesContainer.innerHTML = Object.entries(roleBreakdown).map(([role, count]) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.8rem; background: #f8fafc; border-radius: 8px; margin-bottom: 0.4rem;">
          <span style="font-weight: 600; font-size: 0.88rem; color: #334155;">${role}</span>
          <span class="badge" style="background: var(--primary-light); color: var(--primary); font-weight: 700; font-size: 0.85rem;">${count} users</span>
        </div>
      `).join('');
    }

    // Top Skill Gaps in Cohort
    const gapsContainer = document.getElementById('adminTopSkillGaps');
    if (gapsContainer) {
      gapsContainer.innerHTML = topGaps.slice(0, 5).map(g => `
        <div style="margin-bottom: 0.6rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.2rem;">
            <span style="font-weight: 600; color: #1e293b;">${g.name}</span>
            <span style="color: var(--danger); font-weight: 700;">${g.count} missing</span>
          </div>
          <div style="height: 6px; background: #fee2e2; border-radius: 9999px; overflow: hidden;">
            <div style="height: 100%; width: ${Math.min(100, (g.count / (summary.totalUsers || 5)) * 100)}%; background: var(--danger); border-radius: 9999px;"></div>
          </div>
        </div>
      `).join('');
    }

    // Top In-Demand Skills
    const demandsContainer = document.getElementById('adminTopDemands');
    if (demandsContainer) {
      demandsContainer.innerHTML = topDemands.slice(0, 5).map(d => `
        <span class="skill-tag" style="background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; font-size: 0.82rem; padding: 0.35rem 0.75rem;">
          ${d.name} <strong style="color: #312e81;">(${d.count})</strong>
        </span>
      `).join('');
    }
  },

  async loadUsers() {
    try {
      const res = await window.ApiClient.get('/admin/users');
      if (res && res.success && res.users) {
        this.allUsers = res.users;
        this.filterUsers();
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
    }
  },

  filterUsers() {
    const searchVal = (document.getElementById('adminUserSearch')?.value || '').toLowerCase().trim();
    const roleVal = document.getElementById('adminRoleFilter')?.value || 'ALL';
    const sortVal = document.getElementById('adminSortFilter')?.value || 'READINESS_DESC';

    let list = [...this.allUsers];

    // Filter by text
    if (searchVal) {
      list = list.filter(u => 
        (u.name && u.name.toLowerCase().includes(searchVal)) ||
        (u.email && u.email.toLowerCase().includes(searchVal)) ||
        (u.targetRole && u.targetRole.toLowerCase().includes(searchVal))
      );
    }

    // Filter by role
    if (roleVal !== 'ALL') {
      list = list.filter(u => u.role === roleVal);
    }

    // Sort
    if (sortVal === 'READINESS_DESC') {
      list.sort((a, b) => b.readinessScore - a.readinessScore);
    } else if (sortVal === 'READINESS_ASC') {
      list.sort((a, b) => a.readinessScore - b.readinessScore);
    } else if (sortVal === 'NAME_ASC') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortVal === 'ROADMAP_DESC') {
      list.sort((a, b) => b.roadmapProgress - a.roadmapProgress);
    }

    this.filteredUsers = list;
    this.renderUsersTable(list);
  },

  renderUsersTable(users) {
    const tbody = document.getElementById('adminUsersTableBody');
    const countBadge = document.getElementById('adminUserCountBadge');

    if (countBadge) {
      countBadge.textContent = `${users.length} Learners Found`;
    }

    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            🔍 No users match the selected search criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = users.map((u, idx) => {
      const readinessColor = u.readinessScore >= 75 ? '#10b981' : (u.readinessScore >= 50 ? '#f59e0b' : '#ef4444');
      const readinessBg = u.readinessScore >= 75 ? '#ecfdf5' : (u.readinessScore >= 50 ? '#fffbeb' : '#fef2f2');

      const initials = u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

      return `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
          <td style="padding: 1rem 1.25rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #0ea5e9); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.88rem; flex-shrink: 0;">
                ${initials}
              </div>
              <div>
                <div style="font-weight: 700; color: #1e293b; font-size: 0.95rem;">${u.name}</div>
                <div style="font-size: 0.8rem; color: #64748b;">${u.email}</div>
              </div>
            </div>
          </td>

          <td style="padding: 1rem;">
            <span class="badge" style="background: #f1f5f9; color: #475569; font-weight: 600; font-size: 0.8rem;">
              ${u.role}
            </span>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">
              🎯 ${u.targetRole}
            </div>
          </td>

          <td style="padding: 1rem;">
            ${u.hasResume ? `
              <div style="display: flex; align-items: center; gap: 0.35rem; color: #047857; font-size: 0.85rem; font-weight: 600;">
                <span>✔</span> <span>Uploaded</span>
              </div>
              <div style="font-size: 0.75rem; color: #64748b;">${u.skillsCount} skills detected</div>
            ` : `
              <span style="color: #94a3b8; font-size: 0.82rem;">Pending</span>
            `}
          </td>

          <td style="padding: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
              <span style="font-weight: 800; font-size: 1rem; color: ${readinessColor};">${u.readinessScore}%</span>
              <span class="badge" style="background: ${readinessBg}; color: ${readinessColor}; font-size: 0.72rem; padding: 0.15rem 0.4rem;">
                ${u.readinessLevel}
              </span>
            </div>
            <div style="height: 6px; width: 100px; background: #e2e8f0; border-radius: 9999px; overflow: hidden;">
              <div style="height: 100%; width: ${u.readinessScore}%; background: ${readinessColor}; border-radius: 9999px;"></div>
            </div>
          </td>

          <td style="padding: 1rem;">
            <div style="font-size: 0.88rem; font-weight: 700; color: #1e293b;">
              ${u.roadmapProgress}%
            </div>
            <div style="font-size: 0.75rem; color: #64748b;">
              ${u.completedTasks}/${u.totalTasks} Tasks Done
            </div>
          </td>

          <td style="padding: 1rem;">
            <div style="font-size: 0.88rem; font-weight: 700; color: #3b82f6;">
              ${u.avgQuizAccuracy}
            </div>
            <div style="font-size: 0.75rem; color: #64748b;">
              ${u.quizzesTaken} Quiz${u.quizzesTaken === 1 ? '' : 'zes'} taken
            </div>
          </td>

          <td style="padding: 1rem; text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="window.AdminManager.viewUserDetails('${u.id}')" style="padding: 0.4rem 0.8rem; font-size: 0.82rem;">
              👁️ View Details
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  async viewUserDetails(userId) {
    try {
      if (window.showToast) window.showToast('Fetching student progress dossier...', 'info');

      const res = await window.ApiClient.get(`/admin/user/${userId}`);
      if (!res || !res.success) {
        if (window.showToast) window.showToast('Could not fetch student dossier', 'error');
        return;
      }

      this.selectedUserDossier = res;
      this.renderUserModal(res);
    } catch (err) {
      console.error('Error fetching student dossier:', err);
    }
  },

  renderUserModal(data) {
    const modal = document.getElementById('adminUserModal');
    const user = data.user || {};
    const resume = data.latestResume;
    const analysis = data.latestAnalysis;
    const roadmap = data.latestRoadmap;
    const quizzes = data.quizzes || [];

    // Header info
    document.getElementById('modalUserName').textContent = user.name || 'Student';
    document.getElementById('modalUserEmail').textContent = user.email || '';
    document.getElementById('modalUserRole').textContent = user.role || 'College Student';

    // Readiness & Stats
    const score = analysis ? analysis.readinessScore : (resume ? 55 : 30);
    document.getElementById('modalUserScore').textContent = `${score}%`;
    document.getElementById('modalUserLevel').textContent = analysis ? analysis.readinessLevel : 'In Progress';
    document.getElementById('modalUserTarget').textContent = analysis ? analysis.jobTitle : 'Full Stack Developer';

    // Skills Breakdown
    const matchedContainer = document.getElementById('modalMatchedSkills');
    const missingContainer = document.getElementById('modalMissingSkills');

    if (matchedContainer) {
      const matched = (analysis && analysis.matchedSkills) ? analysis.matchedSkills : (resume && resume.skills ? resume.skills.map(s => s.name || s) : []);
      matchedContainer.innerHTML = matched.length > 0
        ? matched.map(s => `<span class="skill-tag" style="background:#ecfdf5; color:#047857; border: 1px solid #a7f3d0; font-size:0.8rem;">✔ ${s}</span>`).join('')
        : '<span style="color:#94a3b8; font-size:0.85rem;">No matched skills yet</span>';
    }

    if (missingContainer) {
      const missing = (analysis && analysis.missingSkills) ? analysis.missingSkills : ['Docker', 'System Design', 'CI/CD Pipelines'];
      missingContainer.innerHTML = missing.map(s => {
        const name = typeof s === 'string' ? s : (s.name || s.skill || 'Skill Gap');
        return `<span class="skill-tag" style="background:#fef2f2; color:#b91c1c; border: 1px solid #fecaca; font-size:0.8rem;">⚠ ${name}</span>`;
      }).join('');
    }

    // Roadmap Status
    const roadmapContainer = document.getElementById('modalRoadmapStatus');
    if (roadmapContainer) {
      if (roadmap && roadmap.weeks) {
        roadmapContainer.innerHTML = roadmap.weeks.map(w => `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.85rem; color: #1e293b;">
              <span>${w.title}</span>
              <span style="color: var(--primary);">${w.projectMilestone ? '🎯 ' + w.projectMilestone : ''}</span>
            </div>
            <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.2rem;">${w.focus}</div>
          </div>
        `).join('');
      } else {
        roadmapContainer.innerHTML = '<span style="color:#94a3b8; font-size:0.85rem;">Roadmap creation pending.</span>';
      }
    }

    // Quiz History
    const quizContainer = document.getElementById('modalQuizHistory');
    if (quizContainer) {
      if (quizzes.length > 0) {
        quizContainer.innerHTML = quizzes.map((q, i) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.8rem; background: #eff6ff; border-radius: 8px; margin-bottom: 0.4rem; border: 1px solid #bfdbfe;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem; color: #1e40af;">Assessment Attempt #${i + 1}</div>
              <div style="font-size: 0.75rem; color: #1d4ed8;">${q.skillsTested ? q.skillsTested.join(', ') : 'Core Tech Skills'}</div>
            </div>
            <div style="text-align: right;">
              <span class="badge" style="background: #1e40af; color: white; font-weight: 700; font-size: 0.8rem;">${q.accuracyPercentage || 0}% Accuracy</span>
              <div style="font-size: 0.72rem; color: #64748b; margin-top: 0.15rem;">${q.correctCount || 0}/${q.totalQuestions || 5} Correct</div>
            </div>
          </div>
        `).join('');
      } else {
        quizContainer.innerHTML = '<span style="color:#94a3b8; font-size:0.85rem;">No quizzes attempted yet.</span>';
      }
    }

    // Open modal
    modal.style.display = 'flex';
  },

  closeModal() {
    const modal = document.getElementById('adminUserModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
};

window.AdminManager = AdminManager;
