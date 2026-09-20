function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const QuizManager = {
  currentQuiz: null,
  userAnswers: {},
  timerInterval: null,
  secondsLeft: 300,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const startNewQuizBtn = document.getElementById('startNewQuizBtn');
    if (startNewQuizBtn) {
      startNewQuizBtn.addEventListener('click', () => {
        this.startAssessment();
      });
    }

    const startIntroBtn = document.getElementById('startQuizFromIntroBtn');
    if (startIntroBtn) {
      startIntroBtn.addEventListener('click', () => {
        this.startAssessment();
      });
    }

    const retakeBtn = document.getElementById('retakeQuizBtn');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        this.startAssessment();
      });
    }

    const submitQuizBtn = document.getElementById('submitQuizBtn');
    if (submitQuizBtn) {
      submitQuizBtn.addEventListener('click', () => this.submitQuiz());
    }
  },

  getTargetSkills() {
    let skills = [];
    let analysis = window.GapManager ? window.GapManager.currentAnalysis : null;
    if (!analysis) {
      const saved = localStorage.getItem('career_current_analysis');
      if (saved) {
        try { analysis = JSON.parse(saved); } catch (e) {}
      }
    }

    if (analysis) {
      skills = [
        ...(analysis.missingSkills || []).map(s => s.name),
        ...(analysis.weakSkills || []).map(s => s.name)
      ];
    }

    if (skills.length === 0) {
      let resume = window.ResumeManager ? window.ResumeManager.currentResume : null;
      if (!resume) {
        const savedR = localStorage.getItem('career_current_resume');
        if (savedR) {
          try { resume = JSON.parse(savedR); } catch (e) {}
        }
      }
      if (resume && resume.skills) {
        skills = resume.skills.slice(0, 4).map(s => s.name);
      }
    }

    if (skills.length === 0) {
      skills = ['Express.js', 'Responsive Design', 'React', 'Node.js', 'Git'];
    }

    return skills;
  },

  async startAssessment(targetSkills = []) {
    try {
      showToast('Generating AI skill assessment questions...', 'info');
      window.App.navigateTo('quiz');

      if (!targetSkills || targetSkills.length === 0) {
        targetSkills = this.getTargetSkills();
      }

      let res;
      try {
        res = await window.api.generateQuiz(targetSkills, 5);
      } catch (apiErr) {
        console.warn('Backend quiz gen failed, using browser generator:', apiErr.message);
        res = this.generateClientQuiz(targetSkills, 5);
      }

      this.currentQuiz = res;
      this.userAnswers = {};

      this.renderQuiz(res);
      this.startTimer(300); // 5 minutes
      showToast('Quiz started! 5 questions loaded.', 'success');
    } catch (err) {
      showToast('Failed to start quiz: ' + err.message, 'error');
    }
  },

  startTimer(seconds) {
    clearInterval(this.timerInterval);
    this.secondsLeft = seconds;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.secondsLeft--;
      this.updateTimerDisplay();
      if (this.secondsLeft <= 0) {
        clearInterval(this.timerInterval);
        showToast('Time is up! Submitting answers automatically...', 'warning');
        this.submitQuiz(true);
      }
    }, 1000);
  },

  updateTimerDisplay() {
    const timerLabel = document.getElementById('quizTimerDisplay');
    if (!timerLabel) return;
    const mins = Math.floor(this.secondsLeft / 60);
    const secs = this.secondsLeft % 60;
    timerLabel.textContent = `⏱ ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    if (this.secondsLeft < 60) {
      timerLabel.style.color = '#ef4444';
    } else {
      timerLabel.style.color = '#10b981';
    }
  },

  updateAnsweredCounter() {
    const total = this.currentQuiz ? this.currentQuiz.totalQuestions : 5;
    const count = Object.keys(this.userAnswers).length;
    const badge = document.getElementById('quizTotalCountBadge');
    if (badge) {
      badge.textContent = `${count} of ${total} Answered`;
      if (count === total) {
        badge.style.background = '#dcfce7';
        badge.style.color = '#15803d';
      }
    }
  },

  renderQuiz(quiz) {
    const container = document.getElementById('quizQuestionsContainer');
    const introCard = document.getElementById('quizIntroCard');
    const activeBox = document.getElementById('quizActiveBox');
    const resultBox = document.getElementById('quizResultBox');

    if (introCard) introCard.style.display = 'none';
    if (resultBox) resultBox.style.display = 'none';
    if (activeBox) activeBox.style.display = 'block';

    const skillsLabel = quiz.skillsTested && quiz.skillsTested.length > 0
      ? quiz.skillsTested.join(', ')
      : 'Core Technical Stack';

    document.getElementById('quizTestedSkillsBadge').textContent = `Target Skills: ${skillsLabel}`;
    this.updateAnsweredCounter();

    container.innerHTML = '';

    quiz.questions.forEach((q, idx) => {
      const qCard = document.createElement('div');
      qCard.className = 'card';
      qCard.style.marginBottom = '1.25rem';
      qCard.id = `quiz-card-${q.id}`;

      const optionsHtml = q.options.map((opt, optIdx) => `
        <label class="quiz-option-label" style="display:flex; align-items:center; gap:0.75rem; padding:0.85rem 1.1rem; border:1px solid #e2e8f0; border-radius:12px; margin-bottom:0.6rem; cursor:pointer; transition:all 0.2s; background:#ffffff;">
          <input type="radio" name="question_${q.id}" value="${optIdx}" style="width:18px; height:18px; accent-color:var(--primary);">
          <span style="font-size:0.95rem; font-weight:500;">${escapeHtml(opt)}</span>
        </label>
      `).join('');

      qCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <span class="badge badge-tech">Question ${idx + 1} of ${quiz.totalQuestions}</span>
          <span class="badge" style="background:#e0e7ff; color:#3730a3;">Skill: ${escapeHtml(q.skill)}</span>
        </div>
        <h3 style="font-size:1.1rem; font-weight:700; color:var(--dark-bg); margin-bottom:1rem; line-height:1.4;">${escapeHtml(q.question)}</h3>
        <div class="options-group">${optionsHtml}</div>
      `;

      // Option selection handling with active visual styling
      qCard.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          this.userAnswers[q.id] = parseInt(e.target.value, 10);
          
          qCard.querySelectorAll('.quiz-option-label').forEach(lbl => {
            lbl.style.borderColor = '#e2e8f0';
            lbl.style.background = '#ffffff';
            lbl.style.boxShadow = 'none';
          });

          const chosenLabel = e.target.closest('.quiz-option-label');
          if (chosenLabel) {
            chosenLabel.style.borderColor = 'var(--primary)';
            chosenLabel.style.background = 'var(--primary-light)';
            chosenLabel.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.2)';
          }

          this.updateAnsweredCounter();
        });
      });

      container.appendChild(qCard);
    });

    activeBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  async submitQuiz(autoTimeout = false) {
    if (!this.currentQuiz) return;
    clearInterval(this.timerInterval);

    const totalQ = this.currentQuiz.questions.length;
    const answeredCount = Object.keys(this.userAnswers).length;

    if (!autoTimeout && answeredCount < totalQ) {
      const confirmSubmit = confirm(`You have answered ${answeredCount} of ${totalQ} questions. Are you sure you want to submit?`);
      if (!confirmSubmit) return;
    }

    // Format all answers (including unselected)
    const answers = this.currentQuiz.questions.map(q => ({
      questionId: q.id,
      selectedOption: this.userAnswers[q.id] !== undefined ? this.userAnswers[q.id] : null
    }));

    try {
      showToast('Evaluating assessment answers...', 'info');
      let result;

      try {
        const res = await window.api.submitQuiz(this.currentQuiz.quizId, answers);
        result = res.result;
      } catch (err) {
        console.warn('Backend evaluation failed, using client grading:', err.message);
        result = this.evaluateClientQuiz(answers, this.currentQuiz._solutions);
      }

      this.renderResults(result);
      showToast(`Quiz complete! Accuracy: ${result.accuracyPercentage}%`, 'success');
      
      // Update dashboard
      if (window.ProgressManager) {
        window.ProgressManager.loadDashboardData();
      }
    } catch (err) {
      showToast('Evaluation error: ' + err.message, 'error');
    }
  },

  renderResults(result) {
    const activeBox = document.getElementById('quizActiveBox');
    const resultBox = document.getElementById('quizResultBox');

    if (activeBox) activeBox.style.display = 'none';
    if (resultBox) resultBox.style.display = 'block';

    document.getElementById('quizResultAccuracy').textContent = `${result.accuracyPercentage}%`;
    document.getElementById('quizResultSummary').textContent = `${result.correctCount} out of ${result.totalQuestions} questions correct`;
    document.getElementById('quizResultFeedback').textContent = result.feedback;

    const breakdownContainer = document.getElementById('quizDetailedBreakdown');
    if (!breakdownContainer) return;

    breakdownContainer.innerHTML = '';
    result.results.forEach((r, idx) => {
      const item = document.createElement('div');
      item.style.padding = '1.1rem';
      item.style.borderRadius = '12px';
      item.style.marginBottom = '0.85rem';
      item.style.border = r.isCorrect ? '1px solid #10b981' : '1px solid #ef4444';
      item.style.background = r.isCorrect ? '#ecfdf5' : '#fef2f2';

      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
          <div style="font-weight:700; font-size:1rem; color:${r.isCorrect ? '#065f46' : '#991b1b'};">
            ${r.isCorrect ? '✅ Correct' : '❌ ' + (r.userAnswer === null ? 'Unanswered' : 'Incorrect')} — Question #${idx + 1}
          </div>
        </div>
        <div style="font-size:0.9rem; color:#334155; margin-bottom:0.5rem; line-height:1.5;">
          <strong>Explanation:</strong> ${escapeHtml(r.explanation)}
        </div>
      `;

      breakdownContainer.appendChild(item);
    });

    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  // Client-side fallback quiz generator
  generateClientQuiz(targetSkills = [], count = 5) {
    const bank = [
      {
        id: 'cl_exp_1',
        skill: 'Express.js',
        question: 'Which signature is used by Express.js error-handling middleware?',
        options: ['(req, res)', '(err, req, res, next)', '(req, res, next, err)', '(next, err)'],
        correctAnswer: 1,
        explanation: 'Error-handling middleware accepts 4 arguments: (err, req, res, next).'
      },
      {
        id: 'cl_resp_1',
        skill: 'Responsive Design',
        question: 'Which meta tag ensures mobile browsers render pages at appropriate scale?',
        options: [
          'meta name="viewport" content="width=device-width, initial-scale=1.0"',
          'meta name="responsive" content="true"',
          'meta name="scale" content="mobile"',
          'meta name="display" content="flex"'
        ],
        correctAnswer: 0,
        explanation: 'The viewport meta tag matches page width to device screen width.'
      },
      {
        id: 'cl_react_1',
        skill: 'React',
        question: 'Which Hook handles side effects like subscriptions or API calls in React?',
        options: ['useState', 'useEffect', 'useMemo', 'useReducer'],
        correctAnswer: 1,
        explanation: 'useEffect handles side effects after DOM updates.'
      },
      {
        id: 'cl_node_1',
        skill: 'Node.js',
        question: 'How does Node.js achieve non-blocking I/O despite being single-threaded?',
        options: ['Multi-threading in JS', 'Event Loop via libuv', 'Synchronous queues', 'Browser IPC'],
        correctAnswer: 1,
        explanation: 'Node.js delegates asynchronous I/O to libuv event loop worker pool.'
      },
      {
        id: 'cl_git_1',
        skill: 'Git',
        question: 'Which Git command merges feature branch commits into current branch?',
        options: ['git push', 'git merge', 'git clone', 'git commit'],
        correctAnswer: 1,
        explanation: 'git merge incorporates independent branch commits into current checked-out branch.'
      }
    ];

    const questions = bank.slice(0, count);
    return {
      quizId: 'client_quiz_' + Date.now(),
      skillsTested: [...new Set(questions.map(q => q.skill))],
      totalQuestions: questions.length,
      questions: questions.map((q, idx) => ({
        index: idx + 1,
        id: q.id,
        skill: q.skill,
        question: q.question,
        options: q.options
      })),
      _solutions: questions.map(q => ({
        id: q.id,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }))
    };
  },

  evaluateClientQuiz(answers, solutions) {
    const solMap = new Map((solutions || []).map(s => [s.id, s]));
    let correct = 0;
    const results = [];

    (solutions || []).forEach(sol => {
      const userAns = answers.find(a => a.questionId === sol.id);
      const isAnswered = userAns && userAns.selectedOption !== null && userAns.selectedOption !== undefined;
      const isCorrect = isAnswered && userAns.selectedOption === sol.correctAnswer;

      if (isCorrect) correct++;
      results.push({
        questionId: sol.id,
        userAnswer: isAnswered ? userAns.selectedOption : null,
        correctAnswer: sol.correctAnswer,
        isCorrect,
        explanation: sol.explanation
      });
    });

    const total = solutions ? solutions.length : 5;
    const accuracy = Math.round((correct / total) * 100);

    return {
      totalQuestions: total,
      correctCount: correct,
      accuracyPercentage: accuracy,
      feedback: accuracy >= 80 ? 'Outstanding mastery!' : accuracy >= 60 ? 'Solid performance!' : 'Keep practicing with the roadmap!',
      results
    };
  }
};

window.QuizManager = QuizManager;
