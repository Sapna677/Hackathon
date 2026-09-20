const { SKILLS_TAXONOMY } = require('../config/skillsTaxonomy');

/**
 * Extracts skills from input text (Resume or Job Description)
 * Returns structured skills categorized by technical domain.
 * @param {string} text - Raw text from resume or JD
 * @returns {Array<{name: string, category: string, frequency: number}>}
 */
function extractSkills(text) {
  if (!text || typeof text !== 'string') return [];

  const lowerText = ' ' + text.toLowerCase() + ' ';
  const detectedSkillsMap = new Map();

  // Iterate across all categories in taxonomy
  for (const [category, skillsList] of Object.entries(SKILLS_TAXONOMY)) {
    for (const skillObj of skillsList) {
      let matchedFrequency = 0;

      for (const alias of skillObj.aliases) {
        // Escape regex special chars like ++ in C++ or . in Node.js
        const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match word boundaries or punctuation boundaries
        const regex = new RegExp(`(^|[^a-zA-Z0-9#+])${escapedAlias}([^a-zA-Z0-9#+]|$)`, 'gi');
        
        const matches = lowerText.match(regex);
        if (matches) {
          matchedFrequency += matches.length;
        }
      }

      if (matchedFrequency > 0) {
        detectedSkillsMap.set(skillObj.name, {
          name: skillObj.name,
          category: category,
          frequency: matchedFrequency
        });
      }
    }
  }

  return Array.from(detectedSkillsMap.values());
}

/**
 * Categorizes an array of skills into clean UI groups
 */
function categorizeSkills(skillsList) {
  const groups = {
    languages: [],
    frontend: [],
    backend: [],
    databases: [],
    cloudDevOps: [],
    dataAndAI: [],
    softSkills: []
  };

  for (const skill of skillsList) {
    if (groups[skill.category]) {
      groups[skill.category].push(skill.name);
    } else {
      if (!groups.other) groups.other = [];
      groups.other.push(skill.name);
    }
  }

  return groups;
}

module.exports = {
  extractSkills,
  categorizeSkills
};
