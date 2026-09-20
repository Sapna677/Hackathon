const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth.middleware');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    // Check existing user
    const existingUser = db.findOne('users', { email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = db.insert('users', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      userRole: role || 'Student / Job Seeker'
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.userRole
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server registration error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Direct check for default Admin credentials
    if (email.toLowerCase() === 'admin@careerready.ai' && password === 'admin123') {
      const adminUser = {
        id: 'admin_sys_001',
        name: 'System Administrator',
        email: 'admin@careerready.ai',
        role: 'Administrator',
        userRole: 'Administrator',
        isAdmin: true
      };
      const token = jwt.sign(
        { userId: adminUser.id, email: adminUser.email, name: adminUser.name, role: 'Administrator' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        message: 'Admin authorization successful! Welcome to Admin Portal.',
        token,
        user: adminUser
      });
    }

    const user = db.findOne('users', { email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.userRole
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server login error.' });
  }
};

exports.getMe = (req, res) => {
  try {
    const user = db.findOne('users', { id: req.user.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.userRole,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving user.' });
  }
};

// Demo quick-login for evaluation & hackathon presentations
exports.demoLogin = (req, res) => {
  try {
    const demoUser = {
      id: 'demo_user_001',
      name: 'Priya Sharma (Demo Student)',
      email: 'priya.demo@careerready.ai',
      userRole: 'College Fresher / Job Seeker'
    };

    const token = jwt.sign(
      { userId: demoUser.id, email: demoUser.email, name: demoUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Demo login active!',
      token,
      user: demoUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Demo login error.' });
  }
};

// Dedicated Administrator Login (Form or 1-Click Instant)
exports.adminLogin = (req, res) => {
  try {
    const { email, password } = req.body || {};

    // If credentials are supplied, validate them
    if (email && password) {
      if (email.toLowerCase() !== 'admin@careerready.ai' || password !== 'admin123') {
        const user = db.findOne('users', { email: email.toLowerCase() });
        if (!user || (user.userRole !== 'Administrator' && user.userRole !== 'Admin')) {
          return res.status(401).json({
            success: false,
            message: 'Invalid Admin credentials. Use admin@careerready.ai / admin123'
          });
        }
      }
    }

    const adminUser = {
      id: 'admin_sys_001',
      name: 'System Administrator',
      email: 'admin@careerready.ai',
      role: 'Administrator',
      userRole: 'Administrator',
      isAdmin: true
    };

    const token = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, name: adminUser.name, role: 'Administrator' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Admin authorization granted! Redirecting to Admin Portal...',
      token,
      user: adminUser
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during admin login.' });
  }
};

