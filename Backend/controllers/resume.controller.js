const fs = require('fs');
const { parseResumeFile, extractResumeSections } = require('../services/pdfParser.service');
const { extractSkills, categorizeSkills } = require('../services/skillExtractor.service');
const { db } = require('../config/db');

exports.uploadResume = async (req, res) => {
  try {
    let rawText = '';
    let originalName = 'Pasted Resume';
    let filePath = null;

    if (req.file) {
      filePath = req.file.path;
      originalName = req.file.originalname;
      const parsed = await parseResumeFile(filePath);
      rawText = parsed.text;
    } else if (req.body.resumeText) {
      rawText = req.body.resumeText;
      originalName = req.body.resumeName || 'Manual Text Resume';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file or paste resume text.'
      });
    }

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded file does not contain readable text. Please try another file.'
      });
    }

    // Extract structured sections & skills
    const sections = extractResumeSections(rawText);
    const skills = extractSkills(rawText);
    const categorizedSkills = categorizeSkills(skills);

    const resumeRecord = {
      userId: req.user ? req.user.userId : 'guest',
      originalName,
      filePath,
      rawTextPreview: rawText.substring(0, 500) + '...',
      parsedDetails: sections,
      skills,
      categorizedSkills,
      skillsCount: skills.length
    };

    const savedResume = db.insert('resumes', resumeRecord);

    return res.json({
      success: true,
      message: 'Resume parsed and analyzed successfully!',
      resume: savedResume
    });
  } catch (err) {
    console.error('Resume upload error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error processing resume: ' + err.message
    });
  }
};

// Return pre-configured sample resumes for instant testing
exports.getSampleResumes = (req, res) => {
  const samples = [
    {
      id: 'sample-frontend-fresher',
      title: 'Frontend Fresher Resume (Rohan Verma)',
      text: `Rohan Verma
Email: rohan.verma@example.com | Phone: +91 9876543210
Education: B.Tech in Computer Science and Engineering, 2024
Summary: Passionate junior web developer with strong foundation in frontend web technologies.
Technical Skills: JavaScript, HTML5, CSS3, React, Tailwind CSS, Bootstrap, Git, GitHub
Projects:
1. Personal Portfolio Website built with HTML5, CSS3 and JavaScript.
2. Weather Forecast Web App built with React and OpenWeatherMap API using Fetch API.
3. Task Management List using JavaScript and LocalStorage.`
    },
    {
      id: 'sample-backend-junior',
      title: 'Backend Junior Resume (Sneha Patel)',
      text: `Sneha Patel
Email: sneha.patel@example.com | Phone: +91 9123456780
Education: Bachelor of Computer Applications (BCA), 2023
Summary: Backend enthusiast with experience in developing REST APIs using Node.js and Express.
Technical Skills: JavaScript, Node.js, Express.js, MongoDB, SQL, Git, Linux
Projects:
1. E-Commerce Backend REST API with Express.js and MongoDB.
2. User Authentication Service using JWT and Bcrypt.
3. Inventory Database Management with SQL queries.`
    }
  ];

  return res.json({
    success: true,
    samples
  });
};

exports.getResumeHistory = (req, res) => {
  try {
    const userId = req.user ? req.user.userId : 'guest';
    const resumes = db.find('resumes', { userId });
    return res.json({
      success: true,
      resumes
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving resumes.' });
  }
};
