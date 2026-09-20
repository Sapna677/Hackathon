/**
 * AI Skill Gap Analysis Engine
 * Compares extracted Candidate Resume skills against Target Job Description skills.
 */
function analyzeSkillGap(resumeSkills, jdSkills) {
  const resumeSkillNames = new Set(resumeSkills.map(s => s.name.toLowerCase()));
  const resumeSkillMap = new Map(resumeSkills.map(s => [s.name.toLowerCase(), s]));

  const matched = [];
  const missing = [];
  const weak = [];

  // Group JD skills by importance
  for (const jdSkill of jdSkills) {
    const key = jdSkill.name.toLowerCase();

    if (resumeSkillNames.has(key)) {
      const resumeSkill = resumeSkillMap.get(key);
      // If mentioned only once in resume, flag as weak/partial
      if (resumeSkill.frequency === 1) {
        weak.push({
          name: jdSkill.name,
          category: jdSkill.category,
          status: 'weak',
          note: 'Mentioned briefly in resume. Needs deeper project demonstration.'
        });
      } else {
        matched.push({
          name: jdSkill.name,
          category: jdSkill.category,
          status: 'matched',
          frequency: resumeSkill.frequency
        });
      }
    } else {
      missing.push({
        name: jdSkill.name,
        category: jdSkill.category,
        status: 'missing',
        priority: jdSkill.category === 'languages' || jdSkill.category === 'backend' || jdSkill.category === 'frontend' ? 'High' : 'Medium'
      });
    }
  }

  // Calculate Readiness Score
  // Full match = 1.0, Weak match = 0.5, Missing = 0
  const totalJdSkills = jdSkills.length || 1;
  const matchPoints = matched.length * 1.0 + weak.length * 0.5;
  let readinessScore = Math.round((matchPoints / totalJdSkills) * 100);
  if (readinessScore > 100) readinessScore = 100;

  // Determine Readiness Level
  let readinessLevel = 'Foundation Required';
  let badgeColor = 'red';
  let estimatedTimeToReadiness = '8 - 12 Weeks';

  if (readinessScore >= 80) {
    readinessLevel = 'Job Ready';
    badgeColor = 'emerald';
    estimatedTimeToReadiness = '1 - 2 Weeks (Interview Prep)';
  } else if (readinessScore >= 60) {
    readinessLevel = 'Near Ready';
    badgeColor = 'blue';
    estimatedTimeToReadiness = '3 - 4 Weeks';
  } else if (readinessScore >= 40) {
    readinessLevel = 'Moderate Skill Gap';
    badgeColor = 'amber';
    estimatedTimeToReadiness = '4 - 6 Weeks';
  }

  // Key actionable insights
  const recommendations = [];
  if (missing.length > 0) {
    recommendations.push(`Priority focus: Learn missing high-impact skill: ${missing.slice(0, 3).map(s => s.name).join(', ')}.`);
  }
  if (weak.length > 0) {
    recommendations.push(`Build 1 portfolio project demonstrating: ${weak.map(w => w.name).join(', ')}.`);
  }
  if (matched.length > 0) {
    recommendations.push(`Strengths validated in ${matched.slice(0, 4).map(m => m.name).join(', ')}. Highlight these on your resume top section.`);
  }

  return {
    readinessScore,
    readinessLevel,
    badgeColor,
    estimatedTimeToReadiness,
    counts: {
      totalRequired: totalJdSkills,
      matchedCount: matched.length,
      weakCount: weak.length,
      missingCount: missing.length
    },
    matchedSkills: matched,
    weakSkills: weak,
    missingSkills: missing,
    recommendations
  };
}

module.exports = {
  analyzeSkillGap
};
