const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const TeamInvite = require('../models/TeamInvite');
const { sendOTP, verifyOTP } = require('../services/twilioService');

exports.sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone required' });
  try {
    await sendOTP(phone);
    res.json({ message: 'OTP sent' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { phone, code } = req.body;
  try {
    const approved = await verifyOTP(phone, code);
    if (!approved) return res.status(401).json({ message: 'Invalid OTP' });
    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone, name: 'New User' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user, isNewUser: !user.name || user.name === 'New User' });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
};

// Dev login (for testing without Twilio)
exports.devLogin = async (req, res) => {
  const { phone, name } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone required' });
  try {
    let user = await User.findOne({ phone });
    const isNewUser = !user;
    if (!user) user = await User.create({ phone, name: name || 'New User' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user, isNewUser });
  } catch (err) {
    res.status(500).json({ message: 'Dev login failed', error: err.message });
  }
};

exports.createInvite = async (req, res) => {
  const { hackathonId, teamSlots, teamName, description, isOpen } = req.body;
  const token = crypto.randomBytes(8).toString('hex');
  try {
    const invite = await TeamInvite.create({
      createdBy: req.user.userId,
      token,
      teamName: teamName || '',
      description: description || '',
      hackathonId,
      teamSlots: teamSlots || 4,
      isOpen: isOpen !== undefined ? isOpen : true,
      members: [req.user.userId],
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
    });
    res.json({ token, inviteUrl: `${process.env.CLIENT_URL}/join/${token}`, team: invite });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create invite', error: err.message });
  }
};

exports.getInvite = async (req, res) => {
  try {
    const invite = await TeamInvite.findOne({ token: req.params.token })
      .populate('members', 'name role skills xp level badges experience')
      .populate('createdBy', 'name role')
      .populate('joinRequests.user', 'name role skills xp level badges experience githubUsername githubData goals');
    if (!invite) return res.status(404).json({ message: 'Invite not found' });
    res.json(invite);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get invite', error: err.message });
  }
};

exports.joinViaInvite = async (req, res) => {
  const { token } = req.params;
  const { phone } = req.body;
  try {
    const invite = await TeamInvite.findOne({ token });
    if (!invite || invite.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invite expired or invalid' });
    }
    if (invite.members.length >= invite.teamSlots) {
      return res.status(400).json({ message: 'Team is full' });
    }
    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone, name: 'New Member' });
    invite.members.addToSet(user._id);
    await invite.save();
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: jwtToken, user, isNewUser: user.name === 'New Member', invite });
  } catch (err) {
    res.status(500).json({ message: 'Join failed', error: err.message });
  }
};

// ── Join Request System ──

// Request to join a team (authenticated user)
exports.requestToJoin = async (req, res) => {
  const { teamId } = req.params;
  const { message } = req.body;
  const userId = req.user.userId;
  try {
    const team = await TeamInvite.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (!team.isOpen) return res.status(400).json({ message: 'Team is not accepting requests' });
    if (team.members.length >= team.teamSlots) return res.status(400).json({ message: 'Team is full' });
    if (team.members.some(m => m.toString() === userId)) {
      return res.status(400).json({ message: 'You are already a member' });
    }
    // Check if there's already a pending request
    const existing = team.joinRequests.find(r => r.user.toString() === userId && r.status === 'pending');
    if (existing) return res.status(400).json({ message: 'You already have a pending request' });

    team.joinRequests.push({ user: userId, message: message || '' });
    await team.save();
    res.json({ message: 'Join request sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send request', error: err.message });
  }
};

// Accept a join request (team owner only)
exports.acceptRequest = async (req, res) => {
  const { teamId, requestId } = req.params;
  const userId = req.user.userId;
  try {
    const team = await TeamInvite.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.createdBy.toString() !== userId) return res.status(403).json({ message: 'Only the team owner can accept requests' });
    if (team.members.length >= team.teamSlots) return res.status(400).json({ message: 'Team is full' });

    const request = team.joinRequests.id(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already reviewed' });

    request.status = 'accepted';
    request.reviewedAt = new Date();
    team.members.addToSet(request.user);
    await team.save();

    const updatedTeam = await TeamInvite.findById(teamId)
      .populate('members', 'name role skills xp level badges experience githubUsername githubData goals')
      .populate('createdBy', 'name')
      .populate('joinRequests.user', 'name role skills xp level badges experience githubUsername githubData goals');

    res.json({ message: 'Request accepted', team: updatedTeam });
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept request', error: err.message });
  }
};

// Reject a join request (team owner only)
exports.rejectRequest = async (req, res) => {
  const { teamId, requestId } = req.params;
  const userId = req.user.userId;
  try {
    const team = await TeamInvite.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.createdBy.toString() !== userId) return res.status(403).json({ message: 'Only the team owner can reject requests' });

    const request = team.joinRequests.id(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already reviewed' });

    request.status = 'rejected';
    request.reviewedAt = new Date();
    await team.save();

    res.json({ message: 'Request rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject request', error: err.message });
  }
};

// Browse open teams (for discovery)
exports.browseOpenTeams = async (req, res) => {
    try {
      const userId = req.user.userId;
      const teams = await TeamInvite.find({
        isOpen: true,
        expiresAt: { $gt: new Date() },
        $expr: { $lt: [{ $size: '$members' }, '$teamSlots'] }
      })
        .populate('members', 'name role skills')
        .populate('createdBy', 'name role skills')
        .sort({ createdAt: -1 })
        .limit(30);
  
      // Mark which teams the user is already in or has pending requests
      const result = teams.map(t => {
        const obj = t.toObject();
        obj.isMember = t.members.some(m => m._id.toString() === userId);
        obj.hasPendingRequest = t.joinRequests.some(r => r.user.toString() === userId && r.status === 'pending');
        obj.pendingCount = t.joinRequests.filter(r => r.status === 'pending').length;
        // Don't expose other people's join requests in browse
        delete obj.joinRequests;
        return obj;
      });
  
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: 'Failed to browse teams', error: err.message });
    }
  };
  
  // Update team details (owner only)
  exports.updateTeam = async (req, res) => {
    const { teamId } = req.params;
    const { teamName, description, isOpen } = req.body;
    try {
      const team = await TeamInvite.findById(teamId);
      if (!team) return res.status(404).json({ message: 'Team not found' });
      if (team.createdBy.toString() !== req.user.userId) return res.status(403).json({ message: 'Only the owner can update' });
  
      if (teamName !== undefined) team.teamName = teamName;
      if (description !== undefined) team.description = description;
      if (isOpen !== undefined) team.isOpen = isOpen;
      await team.save();
  
      res.json(team);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update team', error: err.message });
    }
  };
  
  // Add a specific user to team (owner only — for AI recommendations)
  exports.addMemberToTeam = async (req, res) => {
    const { teamId } = req.params;
    const { userId: targetUserId } = req.body;
    try {
      const team = await TeamInvite.findById(teamId);
      if (!team) return res.status(404).json({ message: 'Team not found' });
      if (team.createdBy.toString() !== req.user.userId) return res.status(403).json({ message: 'Only the owner can add members' });
      if (team.members.length >= team.teamSlots) return res.status(400).json({ message: 'Team is full' });
  
      team.members.addToSet(targetUserId);
      await team.save();
  
      const updatedTeam = await TeamInvite.findById(teamId)
        .populate('members', 'name role skills xp level badges experience githubUsername githubData goals')
        .populate('createdBy', 'name');
  
      res.json({ message: 'Member added', team: updatedTeam });
    } catch (err) {
      res.status(500).json({ message: 'Failed to add member', error: err.message });
    }
  };
  
  // Send a direct manual invite to a developer (Team owner only)
  exports.inviteUserToTeam = async (req, res) => {
    const { teamId } = req.params;
    const { userId: targetUserId, message } = req.body;
    try {
      const team = await TeamInvite.findById(teamId);
      if (!team) return res.status(404).json({ message: 'Team not found' });
      if (team.createdBy.toString() !== req.user.userId) return res.status(403).json({ message: 'Only the owner can send invites' });
      if (team.members.length >= team.teamSlots) return res.status(400).json({ message: 'Team is full' });
  
      // Check if already in team
      if (team.members.includes(targetUserId)) {
        return res.status(400).json({ message: 'User is already in team' });
      }
  
      // Check if already invited
      const existingInvite = team.sentInvites.find(inv => inv.user.toString() === targetUserId && inv.status === 'pending');
      if (existingInvite) {
        return res.status(400).json({ message: 'User has already been invited to this team' });
      }
  
      team.sentInvites.push({ user: targetUserId, message: message || '' });
      await team.save();
  
      res.json({ message: 'Invite sent successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to send invite', error: err.message });
    }
  };
  
  // Accept a direct manual invite (Invited user only)
  exports.acceptIncomingInvite = async (req, res) => {
    const { teamId, inviteId } = req.params;
    const userId = req.user.userId;
    try {
      const team = await TeamInvite.findById(teamId);
      if (!team) return res.status(404).json({ message: 'Team not found' });
      
      const invite = team.sentInvites.id(inviteId);
      if (!invite) return res.status(404).json({ message: 'Invite not found' });
      if (invite.user.toString() !== userId) return res.status(403).json({ message: 'Not authorized' });
      if (invite.status !== 'pending') return res.status(400).json({ message: 'Invite no longer pending' });
      if (team.members.length >= team.teamSlots) return res.status(400).json({ message: 'Team is now full' });
  
      invite.status = 'accepted';
      team.members.addToSet(userId);
      await team.save();
  
      res.json({ message: 'Joined team successfully!' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to accept invite', error: err.message });
    }
  };
  
  // Reject a direct manual invite (Invited user only)
  exports.rejectIncomingInvite = async (req, res) => {
    const { teamId, inviteId } = req.params;
    const userId = req.user.userId;
    try {
      const team = await TeamInvite.findById(teamId);
      if (!team) return res.status(404).json({ message: 'Team not found' });
      
      const invite = team.sentInvites.id(inviteId);
      if (!invite) return res.status(404).json({ message: 'Invite not found' });
      if (invite.user.toString() !== userId) return res.status(403).json({ message: 'Not authorized' });
      if (invite.status !== 'pending') return res.status(400).json({ message: 'Invite already responded' });
  
      invite.status = 'rejected';
      await team.save();
  
      res.json({ message: 'Invite rejected' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to reject invite', error: err.message });
    }
  };
  
  