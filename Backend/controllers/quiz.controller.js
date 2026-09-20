const { generateQuiz, evaluateQuiz } = require('../services/quiz.service');
const { db } = require('../config/db');

// In-memory or persisted store for active quiz solutions (to prevent cheating)
const activeQuizSessions = new Map();

exports.createQuiz = (req, res) => {
  try {
    const { skills, count, role } = req.body;

    let targetSkills = skills || [];
    if (typeof targetSkills === 'string') {
      targetSkills = [targetSkills];
    }

    // If no explicit skills passed, check latest gap analysis
    if (targetSkills.length === 0) {
      const userId = req.user ? req.user.userId : 'guest';
      const analyses = db.find('analyses', { userId });
      if (analyses.length > 0) {
        const latest = analyses[analyses.length - 1];
        targetSkills = [
          ...latest.missingSkills.map(s => s.name),
          ...latest.weakSkills.map(s => s.name)
        ];
      }
    }

    // Default if still empty
    if (targetSkills.length === 0) {
      targetSkills = ['React', 'Node.js', 'MongoDB', 'Docker', 'Git'];
    }

    const quizData = generateQuiz(targetSkills, count || 5);

    // Save solutions in session store and DB
    const sessionObj = {
      quizId: quizData.quizId,
      solutions: quizData._solutions,
      skillsTested: quizData.skillsTested,
      userId: req.user ? req.user.userId : 'guest',
      createdAt: Date.now()
    };
    activeQuizSessions.set(quizData.quizId, sessionObj);
    db.insert('quizSessions', sessionObj);

    return res.json({
      success: true,
      quizId: quizData.quizId,
      skillsTested: quizData.skillsTested,
      totalQuestions: quizData.totalQuestions,
      questions: quizData.questions
    });
  } catch (err) {
    console.error('Quiz creation error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error generating quiz assessment.'
    });
  }
};

exports.submitQuiz = (req, res) => {
  try {
    const { quizId, answers } = req.body;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and answers array are required.'
      });
    }

    let session = activeQuizSessions.get(quizId);
    if (!session) {
      session = db.findOne('quizSessions', { quizId });
    }

    let solutions = [];

    if (session && session.solutions && session.solutions.length > 0) {
      solutions = session.solutions;
    } else {
      // Fallback: search question bank across all categories
      const { QUESTION_BANK, GENERAL_QUESTIONS } = require('../services/quiz.service');
      const allQ = [...Object.values(QUESTION_BANK).flat(), ...GENERAL_QUESTIONS];
      solutions = answers.map(a => {
        const found = allQ.find(q => q.id === a.questionId);
        return {
          id: a.questionId,
          correctAnswer: found ? found.correctAnswer : 0,
          explanation: found ? found.explanation : 'Correct answer explanation.'
        };
      });
    }

    const evaluation = evaluateQuiz(answers, solutions);

    const quizRecord = {
      userId: req.user ? req.user.userId : 'guest',
      quizId,
      skillsTested: session ? session.skillsTested : [],
      ...evaluation,
      takenAt: new Date().toISOString()
    };

    const savedQuiz = db.insert('quizzes', quizRecord);

    return res.json({
      success: true,
      message: 'Quiz evaluated successfully!',
      result: savedQuiz
    });
  } catch (err) {
    console.error('Submit quiz error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error evaluating quiz submission.'
    });
  }
};

exports.getQuizHistory = (req, res) => {
  try {
    const userId = req.user ? req.user.userId : 'guest';
    const quizzes = db.find('quizzes', { userId });

    return res.json({
      success: true,
      quizzes: quizzes.reverse()
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving quiz history.' });
  }
};
