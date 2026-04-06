const User = require('../models/User');
const { awardXP } = require('../utils/xpManager');
const { assignRole } = require('../services/matchingService');

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, skills, role, experience, availability, goals, projectInterest, workingStyle } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (skills) updateData.skills = skills;
    if (role) updateData.role = role;
    if (experience) updateData.experience = experience;
    if (availability) updateData.availability = availability;
    if (goals) updateData.goals = goals;
    if (projectInterest) updateData.projectInterest = projectInterest;
    if (workingStyle) updateData.workingStyle = workingStyle;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

    // Auto-assign role based on skills
    if (skills) {
      const autoRole = assignRole(user);
      user.assignedRole = autoRole;
      await user.save();
    }

    // Award XP for profile completion
    if (name && name !== 'New User' && skills && skills.length > 0) {
      await awardXP(userId, 20, 'profile_complete');
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Profile update failed', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user', error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-phone');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user', error: err.message });
  }
};

exports.saveAvailability = async (req, res) => {
  try {
    const { availabilityGrid } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { availabilityGrid },
      { new: true }
    );
    res.json({ message: 'Availability saved', availabilityGrid: user.availabilityGrid });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save availability', error: err.message });
  }
};

exports.toggleBlindMode = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.blindMode = !user.blindMode;
    await user.save();
    res.json({ blindMode: user.blindMode });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle blind mode', error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } }).select('-phone');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get users', error: err.message });
  }
};

exports.getMyTeams = async (req, res) => {
  try {
    const TeamInvite = require('../models/TeamInvite');
    const userId = req.user.userId;
    const teams = await TeamInvite.find({
      $or: [
        { createdBy: userId },
        { members: userId }
      ]
    })
      .populate('members', 'name role skills experience xp level badges githubUsername githubData goals workingStyle voiceIntroUrl')
      .populate('createdBy', 'name')
      .populate('joinRequests.user', 'name role skills experience xp level badges githubUsername githubData goals')
      .sort({ createdAt: -1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get teams', error: err.message });
  }
};

exports.getDevelopers = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Find all users except the current user
    const users = await User.find({ _id: { $ne: userId } })
      .select('name role skills experience xp level badges githubUsername githubData goals workingStyle')
      .sort({ xp: -1 })
      .limit(50);
      
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch developers', error: err.message });
  }
};

exports.getIncomingInvites = async (req, res) => {
  try {
    const TeamInvite = require('../models/TeamInvite');
    const userId = req.user.userId;
    
    // Find teams where sentInvites contains the user and status is pending
    const teams = await TeamInvite.find({
      'sentInvites.user': userId,
      'sentInvites.status': 'pending'
    })
      .populate('createdBy', 'name role')
      .populate('members', 'name role skills')
      .select('teamName description createdBy members teamSlots sentInvites createdAt');
      
    // Filter the sentInvites array to only include the user's invite in the response
    const formattedTeams = teams.map(team => {
      const t = team.toObject();
      t.myInvite = t.sentInvites.find(i => i.user.toString() === userId && i.status === 'pending');
      delete t.sentInvites;
      return t;
    });

    res.json(formattedTeams);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get incoming invites', error: err.message });
  }
};
