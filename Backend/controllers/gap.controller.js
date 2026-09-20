const { analyzeSkillGap } = require('../services/gapEngine.service');
const { db } = require('../config/db');

exports.analyzeGap = (req, res) => {
  try {
    const { resumeId, jdId, resumeSkills, jdSkills, jobTitle } = req.body;

    let rSkills = resumeSkills || [];
    let jSkills = jdSkills || [];

    // If IDs were passed, retrieve from DB
    if (resumeId && (!rSkills || rSkills.length === 0)) {
      const resume = db.findOne('resumes', { id: resumeId });
      if (resume) rSkills = resume.skills;
    }

    if (jdId && (!jSkills || jSkills.length === 0)) {
      const jd = db.findOne('jobDescriptions', { id: jdId });
      if (jd) jSkills = jd.detectedSkills;
    }

    if (!jSkills || jSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No skills found in target job description to compare against.'
      });
    }

    const gapResult = analyzeSkillGap(rSkills, jSkills);

    const analysisRecord = {
      userId: req.user ? req.user.userId : 'guest',
      jobTitle: jobTitle || 'Target Job Role',
      resumeId: resumeId || null,
      jdId: jdId || null,
      ...gapResult
    };

    const savedAnalysis = db.insert('analyses', analysisRecord);

    return res.json({
      success: true,
      message: 'Skill gap analysis generated successfully!',
      analysis: savedAnalysis
    });
  } catch (err) {
    console.error('Gap analysis error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error computing skill gap analysis.'
    });
  }
};

exports.getLatestAnalysis = (req, res) => {
  try {
    const userId = req.user ? req.user.userId : 'guest';
    const analyses = db.find('analyses', { userId });
    const latest = analyses.length > 0 ? analyses[analyses.length - 1] : null;

    return res.json({
      success: true,
      analysis: latest
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving analysis.' });
  }
};
