const { generateRoadmap } = require('../services/roadmap.service');
const { db } = require('../config/db');

exports.createRoadmap = (req, res) => {
  try {
    const { missingSkills, weakSkills, targetRole, analysisId } = req.body;

    let mSkills = missingSkills || [];
    let wSkills = weakSkills || [];
    let role = targetRole || 'Software Engineer';

    // If analysisId is provided and lists are empty
    if (analysisId && mSkills.length === 0) {
      const analysis = db.findOne('analyses', { id: analysisId });
      if (analysis) {
        mSkills = analysis.missingSkills;
        wSkills = analysis.weakSkills;
        role = analysis.jobTitle || role;
      }
    }

    const roadmapData = generateRoadmap(mSkills, wSkills, role);

    const roadmapRecord = {
      userId: req.user ? req.user.userId : 'guest',
      analysisId: analysisId || null,
      ...roadmapData,
      completedTasksCount: 0,
      totalTasksCount: roadmapData.weeks.reduce((acc, w) => acc + w.tasks.length, 0),
      progressPercentage: 0
    };

    const savedRoadmap = db.insert('roadmaps', roadmapRecord);

    return res.json({
      success: true,
      message: 'Personalized learning roadmap generated!',
      roadmap: savedRoadmap
    });
  } catch (err) {
    console.error('Roadmap error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error generating learning roadmap.'
    });
  }
};

exports.toggleTask = (req, res) => {
  try {
    const { roadmapId, taskId } = req.body;

    const roadmap = db.findOne('roadmaps', { id: roadmapId });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found.' });
    }

    let found = false;
    let completedCount = 0;
    let totalCount = 0;

    for (const week of roadmap.weeks) {
      for (const task of week.tasks) {
        totalCount++;
        if (task.id === taskId) {
          task.completed = !task.completed;
          found = true;
        }
        if (task.completed) completedCount++;
      }
    }

    if (!found) {
      return res.status(404).json({ success: false, message: 'Task ID not found in roadmap.' });
    }

    const progressPercentage = Math.round((completedCount / totalCount) * 100);

    const updated = db.update('roadmaps', { id: roadmapId }, {
      weeks: roadmap.weeks,
      completedTasksCount: completedCount,
      totalTasksCount: totalCount,
      progressPercentage
    });

    return res.json({
      success: true,
      message: 'Task updated successfully!',
      roadmap: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating task.' });
  }
};

exports.getLatestRoadmap = (req, res) => {
  try {
    const userId = req.user ? req.user.userId : 'guest';
    const roadmaps = db.find('roadmaps', { userId });
    const latest = roadmaps.length > 0 ? roadmaps[roadmaps.length - 1] : null;

    return res.json({
      success: true,
      roadmap: latest
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving roadmap.' });
  }
};
