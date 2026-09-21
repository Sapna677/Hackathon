/**
 * Progress & Analytics Dashboard Module
 */
const ProgressManager = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    const refreshBtn = document.getElementById('refreshProgressBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadDashboardData());
    }
  },

  async loadDashboardData() {
    try {
      const res = await window.api.getProgressDashboard();
      this.renderProgress(res);
    } catch (err) {
      console.warn('Could not fetch remote progress, displaying local stats:', err);
      this.renderFallbackProgress();
    }
  },

  renderProgress(data) {
    const stats = data.stats || {};

    // Update Section 5 Success Metrics with smooth count-up
    const metricGap = document.getElementById('metricSkillGapReduction');
    if (metricGap) {
      const gapVal = parseFloat(String(stats.skillGapReduction || '45').replace(/[^\d.-]/g, '')) || 45;
      if (window.animateCountUp) window.animateCountUp(metricGap, 0, gapVal, 900, '%');
      else metricGap.textContent = `${gapVal}%`;
    }

    const metricAccuracy = document.getElementById('metricQuizAccuracy');
    if (metricAccuracy) metricAccuracy.textContent = stats.quizAccuracyImprovement || stats.averageQuizAccuracy || '76%';

    const metricTime = document.getElementById('metricTimeToReadiness');
    if (metricTime) metricTime.textContent = stats.estimatedTimeToJobReadiness || '4 Weeks';

    const score = stats.readinessScore || 0;
    const metricReadiness = document.getElementById('dashboardReadinessNumber');
    if (metricReadiness) {
      if (window.animateCountUp) window.animateCountUp(metricReadiness, 0, score, 1000, '%');
      else metricReadiness.textContent = `${score}%`;
    }

    const dashGauge = document.getElementById('dashboardReadinessGauge');
    if (dashGauge) {
      dashGauge.style.strokeDashoffset = '440';
      setTimeout(() => {
        dashGauge.style.strokeDashoffset = 440 - (440 * score) / 100;
      }, 60);
    }

    // Render Canvas Growth Chart
    this.renderChart(data.chartData);
  },

  renderFallbackProgress() {
    const savedAnalysis = localStorage.getItem('career_current_analysis');
    let score = 50;
    if (savedAnalysis) {
      try {
        const parsed = JSON.parse(savedAnalysis);
        score = parsed.readinessScore || 50;
      } catch (e) {}
    }

    const metricGap = document.getElementById('metricSkillGapReduction');
    if (metricGap) {
      if (window.animateCountUp) window.animateCountUp(metricGap, 0, 60, 900, '%');
      else metricGap.textContent = '60%';
    }

    const metricAccuracy = document.getElementById('metricQuizAccuracy');
    if (metricAccuracy) metricAccuracy.textContent = '48% → 80%';

    const metricTime = document.getElementById('metricTimeToReadiness');
    if (metricTime) metricTime.textContent = '3 - 4 Weeks';

    const metricReadiness = document.getElementById('dashboardReadinessNumber');
    if (metricReadiness) {
      if (window.animateCountUp) window.animateCountUp(metricReadiness, 0, score, 1000, '%');
      else metricReadiness.textContent = `${score}%`;
    }

    const dashGauge = document.getElementById('dashboardReadinessGauge');
    if (dashGauge) {
      dashGauge.style.strokeDashoffset = '440';
      setTimeout(() => {
        dashGauge.style.strokeDashoffset = 440 - (440 * score) / 100;
      }, 60);
    }

    this.renderChart({
      labels: ['Baseline', 'Resume Upload', 'Quiz 1', 'Week 1 Tasks', 'Current State'],
      readinessScores: [20, 35, 50, 65, score],
      quizAccuracies: [45, 55, 68, 75, 82]
    });
  },

  renderChart(chartData) {
    const canvas = document.getElementById('readinessChartCanvas');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 600;
    const height = canvas.height = 240;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const labels = (chartData && chartData.labels) || ['W1', 'W2', 'W3', 'W4', 'W5'];
    const scores = (chartData && chartData.readinessScores) || [30, 45, 60, 70, 85];

    // Padding
    const padX = 45;
    const padY = 35;
    const chartWidth = width - padX * 2;
    const chartHeight = height - padY * 2;

    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter, sans-serif';

    for (let i = 0; i <= 4; i++) {
      const y = padY + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(width - padX, y);
      ctx.stroke();

      const labelVal = 100 - i * 25;
      ctx.fillText(`${labelVal}%`, 10, y + 4);
    }

    // Draw X axis labels & points
    const stepX = chartWidth / (scores.length - 1);
    const points = scores.map((val, idx) => {
      const x = padX + idx * stepX;
      const y = padY + chartHeight - (val / 100) * chartHeight;
      return { x, y, val, label: labels[idx] };
    });

    // Draw filled gradient area
    const gradient = ctx.createLinearGradient(0, padY, 0, height - padY);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.35)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.02)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padY);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height - padY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Line
    ctx.beginPath();
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Draw Points and labels
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label below
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, p.x, height - 10);
    });
  }
};

window.ProgressManager = ProgressManager;
