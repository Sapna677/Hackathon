const { PREDEFINED_ROLES } = require('../config/skillsTaxonomy');
const { extractSkills, categorizeSkills } = require('../services/skillExtractor.service');
const { db } = require('../config/db');

exports.getPredefinedRoles = (req, res) => {
  return res.json({
    success: true,
    roles: PREDEFINED_ROLES
  });
};

exports.analyzeJobDescription = (req, res) => {
  try {
    const { roleId, customJdText, jobTitle } = req.body;

    let targetTitle = jobTitle || 'Target Role';
    let rawText = customJdText || '';
    let extractedRequired = [];

    // If pre-defined role selected
    if (roleId) {
      const predefined = PREDEFINED_ROLES.find(r => r.id === roleId);
      if (predefined) {
        targetTitle = predefined.title;
        rawText = predefined.description + ' Required Skills: ' + predefined.requiredSkills.join(', ');
        extractedRequired = predefined.requiredSkills;
      }
    }

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select a job role or paste a job description.'
      });
    }

    // Extract skills from JD
    const detectedSkills = extractSkills(rawText);

    // If predefined role had skills not caught by free text, merge them
    for (const reqSkill of extractedRequired) {
      if (!detectedSkills.some(s => s.name.toLowerCase() === reqSkill.toLowerCase())) {
        detectedSkills.push({
          name: reqSkill,
          category: 'backend',
          frequency: 1
        });
      }
    }

    const categorized = categorizeSkills(detectedSkills);

    const jdRecord = {
      userId: req.user ? req.user.userId : 'guest',
      jobTitle: targetTitle,
      rawText: rawText.substring(0, 1000),
      detectedSkills,
      categorized,
      skillsCount: detectedSkills.length
    };

    const savedJd = db.insert('jobDescriptions', jdRecord);

    return res.json({
      success: true,
      message: 'Job description analyzed successfully!',
      jobDescription: savedJd
    });
  } catch (err) {
    console.error('JD analysis error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing job description.'
    });
  }
};
