const { generateChatResponse } = require('../services/chat.service');
const { db } = require('../config/db');

exports.handleChatMessage = async (req, res) => {
  try {
    const { message, context: clientContext } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.'
      });
    }

    // Build user context
    const context = { ...(clientContext || {}) };

    // If user is logged in, pull personalized details from DB
    if (req.user && req.user.userId) {
      const userId = req.user.userId;
      const userRecord = db.findOne('users', { id: userId });
      if (userRecord) {
        context.userName = userRecord.name;
        context.userRole = userRecord.role;
      }

      // Check latest gap analysis
      const analyses = db.find('analyses', { userId });
      if (analyses && analyses.length > 0) {
        const latest = analyses[analyses.length - 1];
        context.targetRole = latest.targetRole || context.targetRole;
        context.readinessScore = latest.readinessScore || context.readinessScore;
        context.missingSkills = (latest.missingSkills || []).map(s => s.name || s);
        context.verifiedSkills = (latest.matchedSkills || []).map(s => s.name || s);
      }
    }

    const result = await generateChatResponse(message, context);

    return res.json({
      success: true,
      reply: result.reply,
      suggestedChips: result.suggestedChips || [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Chat controller error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process AI chat message.',
      reply: 'I encountered an unexpected issue. Please ask again or select one of the suggested topics below.',
      suggestedChips: ['How to improve resume?', 'How to bridge skill gaps?', 'Start AI Quiz']
    });
  }
};
