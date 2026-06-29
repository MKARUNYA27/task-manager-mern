const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = express.Router();

// Delete user account and all their tasks
router.delete('/me', auth, async (req, res) => {
  try {
    await Task.deleteMany({ user: req.user.id });
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account and all tasks deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;