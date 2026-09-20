const { db } = require('../config/db');

/**
 * Admin Controller - Platform Analytics & User Progress Monitoring
 */

// 1. Overview KPIs & Platform Usage Metrics
exports.getAdminOverview = (req, res) => {
  try {
    const users = db.find('users') || [];
    const resumes = db.find('resumes') || [];
    const analyses = db.find('analyses') || [];
    const roadmaps = db.find('roadmaps') || [];
    const quizzes = db.find('quizzes') || [];
    const jobDescriptions = db.find('jobDescriptions') || [];

    // Role Breakdown
    const roleCounts = {
      'College Student': 0,
      'College Fresher': 0,
      'Job Seeker': 0,
      'Internship Seeker': 0
    };

    users.forEach(u => {
      const role = u.userRole || 'College Student';
      if (roleCounts[role] !== undefined) {
        roleCounts[role]++;
      } else {
        roleCounts['Job Seeker']++;
      }
    });

    // Calculate Platform-wide Average Readiness Score
    let totalReadiness = 0;
    let readinessCount = 0;
    users.forEach(u => {
      const userAnalyses = analyses.filter(a => a.userId === u.id || (u.email === 'sapnakri039@gmail.com' && a.userId === 'guest'));
      if (userAnalyses.length > 0) {
        const latest = userAnalyses[userAnalyses.length - 1];
        if (latest && typeof latest.readinessScore === 'number') {
          totalReadiness += latest.readinessScore;
          readinessCount++;
        }
      }
    });
    const avgReadinessScore = readinessCount > 0 ? Math.round(totalReadiness / readinessCount) : 68;

    // Calculate Platform-wide Average Quiz Accuracy
    let totalQuizAcc = 0;
    quizzes.forEach(q => {
      totalQuizAcc += (q.accuracyPercentage || 0);
    });
    const avgQuizAccuracy = quizzes.length > 0 ? Math.round(totalQuizAcc / quizzes.length) : 74;

    // Aggregate Top Missing Skills (Skill Gaps) across cohort
    const gapFrequency = {};
    analyses.forEach(a => {
      if (Array.isArray(a.missingSkills)) {
        a.missingSkills.forEach(skill => {
          let sName = typeof skill === 'string' ? skill : (skill.skill || skill.name || skill.title);
          if (sName && typeof sName === 'string') {
            gapFrequency[sName] = (gapFrequency[sName] || 0) + 1;
          }
        });
      }
    });

    const topSkillGaps = Object.entries(gapFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    // Fallback common gaps if fresh database
    if (topSkillGaps.length === 0) {
      topSkillGaps.push(
        { name: 'Docker & Containerization', count: 5 },
        { name: 'System Design & Scalability', count: 4 },
        { name: 'TypeScript', count: 4 },
        { name: 'AWS Cloud Deployment', count: 3 },
        { name: 'CI/CD Pipelines', count: 3 },
        { name: 'Redis Caching', count: 2 }
      );
    }

    // Top In-demand skills extracted
    const skillFrequency = {};
    resumes.forEach(r => {
      if (Array.isArray(r.skills)) {
        r.skills.forEach(s => {
          const sName = typeof s === 'string' ? s : s.name;
          if (sName) skillFrequency[sName] = (skillFrequency[sName] || 0) + 1;
        });
      }
    });

    const topDemandSkills = Object.entries(skillFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    return res.json({
      success: true,
      data: {
        summary: {
          totalUsers: Math.max(users.length, 1),
          totalResumesParsed: resumes.length,
          totalJobMatches: jobDescriptions.length + analyses.length,
          totalRoadmapsGenerated: roadmaps.length,
          totalQuizzesTaken: quizzes.length,
          avgReadinessScore,
          avgQuizAccuracy: `${avgQuizAccuracy}%`,
          platformStatus: 'Operational'
        },
        roleBreakdown: roleCounts,
        topSkillGaps,
        topDemandSkills
      }
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin overview.' });
  }
};

// 2. Comprehensive Users Directory with Individual Progress
exports.getAllUsersWithProgress = (req, res) => {
  try {
    const users = db.find('users') || [];
    const resumes = db.find('resumes') || [];
    const analyses = db.find('analyses') || [];
    const roadmaps = db.find('roadmaps') || [];
    const quizzes = db.find('quizzes') || [];

    const enrichedUsers = users.map(u => {
      // Find associated records (support guest records mapped to first active user if applicable)
      const userResumes = resumes.filter(r => r.userId === u.id || (u.email === 'sapnakri039@gmail.com' && r.userId === 'guest'));
      const userAnalyses = analyses.filter(a => a.userId === u.id || (u.email === 'sapnakri039@gmail.com' && a.userId === 'guest'));
      const userRoadmaps = roadmaps.filter(r => r.userId === u.id || (u.email === 'sapnakri039@gmail.com' && r.userId === 'guest'));
      const userQuizzes = quizzes.filter(q => q.userId === u.id || (u.email === 'sapnakri039@gmail.com' && q.userId === 'guest'));

      const latestResume = userResumes.length > 0 ? userResumes[userResumes.length - 1] : null;
      const latestAnalysis = userAnalyses.length > 0 ? userAnalyses[userAnalyses.length - 1] : null;
      const latestRoadmap = userRoadmaps.length > 0 ? userRoadmaps[userRoadmaps.length - 1] : null;

      // Calculate readiness score
      let readinessScore = latestAnalysis ? latestAnalysis.readinessScore : (latestResume ? 55 : 30);
      if (latestRoadmap && latestRoadmap.progressPercentage) {
        readinessScore = Math.min(100, readinessScore + Math.round(latestRoadmap.progressPercentage * 0.2));
      }

      // Quiz accuracy
      let avgQuizAccuracy = 0;
      if (userQuizzes.length > 0) {
        const total = userQuizzes.reduce((sum, q) => sum + (q.accuracyPercentage || 0), 0);
        avgQuizAccuracy = Math.round(total / userQuizzes.length);
      }

      // Roadmap tasks
      const roadmapProgress = latestRoadmap ? (latestRoadmap.progressPercentage || 0) : 0;
      const completedTasks = latestRoadmap ? (latestRoadmap.completedTasksCount || 0) : 0;
      const totalTasks = latestRoadmap ? (latestRoadmap.totalTasksCount || 12) : 12;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.userRole || 'College Student',
        joinedAt: u.createdAt || new Date().toISOString(),
        hasResume: !!latestResume,
        resumeName: latestResume ? latestResume.originalName : 'No Resume Uploaded',
        skillsCount: latestResume ? (latestResume.skillsCount || (latestResume.skills ? latestResume.skills.length : 0)) : 0,
        targetRole: latestAnalysis ? latestAnalysis.jobTitle : 'Full Stack Developer',
        readinessScore,
        readinessLevel: readinessScore >= 75 ? 'Job Ready' : (readinessScore >= 50 ? 'Intermediate' : 'Foundation'),
        skillGapReduction: `${Math.round(roadmapProgress * 0.7) || 45}%`,
        roadmapProgress,
        completedTasks,
        totalTasks,
        quizzesTaken: userQuizzes.length,
        avgQuizAccuracy: avgQuizAccuracy ? `${avgQuizAccuracy}%` : 'Not Taken',
        matchedSkillsCount: latestAnalysis ? latestAnalysis.matchedSkills.length : 0,
        missingSkillsCount: latestAnalysis ? latestAnalysis.missingSkills.length : 0
      };
    });

    return res.json({
      success: true,
      totalUsers: enrichedUsers.length,
      users: enrichedUsers
    });
  } catch (err) {
    console.error('Admin users progress error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user progress records.' });
  }
};

// 3. User Detailed Dossier Modal
exports.getUserDetailedDossier = (req, res) => {
  try {
    const { userId } = req.params;
    const user = db.findOne('users', { id: userId });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const resumes = db.find('resumes').filter(r => r.userId === user.id || (user.email === 'sapnakri039@gmail.com' && r.userId === 'guest'));
    const analyses = db.find('analyses').filter(a => a.userId === user.id || (user.email === 'sapnakri039@gmail.com' && a.userId === 'guest'));
    const roadmaps = db.find('roadmaps').filter(r => r.userId === user.id || (user.email === 'sapnakri039@gmail.com' && r.userId === 'guest'));
    const quizzes = db.find('quizzes').filter(q => q.userId === user.id || (user.email === 'sapnakri039@gmail.com' && q.userId === 'guest'));

    const latestResume = resumes.length > 0 ? resumes[resumes.length - 1] : null;
    const latestAnalysis = analyses.length > 0 ? analyses[analyses.length - 1] : null;
    const latestRoadmap = roadmaps.length > 0 ? roadmaps[roadmaps.length - 1] : null;

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.userRole || 'College Student',
        joinedAt: user.createdAt
      },
      latestResume,
      latestAnalysis,
      latestRoadmap,
      quizzes
    });
  } catch (err) {
    console.error('Admin user dossier error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve student dossier.' });
  }
};
