const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

/**
 * Extracts raw text from a PDF file or text file
 * @param {string} filePath - Absolute path to the file
 * @returns {Promise<{text: string, pages: number}>}
 */
async function parseResumeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.txt') {
    const text = fs.readFileSync(filePath, 'utf-8');
    return {
      text,
      pages: 1,
      info: { title: path.basename(filePath) }
    };
  }

  // Handle PDF parsing
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);

  return {
    text: data.text,
    pages: data.numpages,
    info: data.info || {}
  };
}

/**
 * Parses basic structured sections from resume text (Education, Experience, Contact, Skills)
 * @param {string} text 
 */
function extractResumeSections(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Extract email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[1] : '';

  // Extract phone
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Candidate Name heuristic (typically first or second non-empty line)
  let name = 'Candidate';
  for (let i = 0; i < Math.min(lines.length, 4); i++) {
    const line = lines[i];
    if (line.length > 2 && line.length < 35 && !line.includes('@') && !/\d/.test(line)) {
      name = line;
      break;
    }
  }

  // Detect education keywords
  const educationKeywords = ['bachelor', 'master', 'b.tech', 'm.tech', 'bsc', 'msc', 'computer science', 'degree', 'university', 'college'];
  const educationMatches = lines.filter(l => educationKeywords.some(k => l.toLowerCase().includes(k))).slice(0, 3);

  // Detect experience mentions
  const experienceKeywords = ['intern', 'developer', 'engineer', 'experience', 'worked at', 'freelance', 'years of experience'];
  const experienceMatches = lines.filter(l => experienceKeywords.some(k => l.toLowerCase().includes(k))).slice(0, 4);

  return {
    name,
    email,
    phone,
    education: educationMatches.length > 0 ? educationMatches : ['Degree in Computer Science or Related Field'],
    experienceHighlights: experienceMatches.length > 0 ? experienceMatches : ['Practical projects and coursework']
  };
}

module.exports = {
  parseResumeFile,
  extractResumeSections
};
