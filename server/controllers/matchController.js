const User = require('../models/User');
const TeamInvite = require('../models/TeamInvite');
const { calculateMatchScore, assignRole } = require('../services/matchingService');
const { generateMatchExplanation, generateProjectIdeas, analyzeTeamHealth } = require('../services/groqService');

exports.getMatches = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const others = await User.find({
      _id: { $ne: user._id },
      name: { $ne: 'New User' }
    });

    const matches = others.map(other => {
      const result = calculateMatchScore(user, other);
      const otherData = other.blindMode
        ? { ...other.toObject(), name: 'Anonymous Developer', phone: undefined }
        : { ...other.toObject(), phone: undefined };
      return {
        user: otherData,
        compatibility: result.percentage,
        breakdown: result.breakdown,
        sharedSkills: result.sharedSkills,
        assignedRole: assignRole(other)
      };
    });

    matches.sort((a, b) => b.compatibility - a.compatibility);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: 'Matching failed', error: err.message });
  }
};

exports.getMatchExplanation = async (req, res) => {
  try {
    const { userId, targetId } = req.params;
    const user = await User.findById(userId);
    const target = await User.findById(targetId);
    if (!user || !target) return res.status(404).json({ message: 'User not found' });

    const result = calculateMatchScore(user, target);
    const explanation = await generateMatchExplanation(user, target, result.percentage, result.breakdown);
    res.json({ explanation, score: result.percentage, breakdown: result.breakdown });
  } catch (err) {
    // Fallback to template explanation
    res.json({
      explanation: 'These two developers have complementary skill sets that would make for a strong hackathon partnership.',
      score: 0,
      breakdown: {}
    });
  }
};

exports.getTeamSuggestion = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const others = await User.find({
      _id: { $ne: user._id },
      name: { $ne: 'New User' }
    });

    // Score and sort all matches
    const scored = others.map(other => ({
      user: other,
      role: assignRole(other),
      ...calculateMatchScore(user, other)
    }));
    scored.sort((a, b) => b.percentage - a.percentage);

    // Pick top 3 with diverse roles
    const team = [{ user, role: assignRole(user) }];
    const usedRoles = new Set([team[0].role]);

    for (const match of scored) {
      if (team.length >= 4) break;
      if (!usedRoles.has(match.role)) {
        team.push({ user: match.user, role: match.role });
        usedRoles.add(match.role);
      }
    }

    // Fill remaining slots if needed
    for (const match of scored) {
      if (team.length >= 4) break;
      if (!team.find(t => t.user._id.equals(match.user._id))) {
        team.push({ user: match.user, role: match.role });
      }
    }

    // Generate project ideas
    let ideas = [];
    try {
      const ideaResult = await generateProjectIdeas(team);
      ideas = ideaResult.ideas || [];
    } catch (e) {
      console.error('[Match] Idea generation failed:', e.message);
    }

    res.json({ team, ideas });
  } catch (err) {
    res.status(500).json({ message: 'Team suggestion failed', error: err.message });
  }
};

exports.getTeamHealth = async (req, res) => {
  try {
    const { teamId } = req.params;
    const invite = await TeamInvite.findById(teamId).populate('members');
    if (!invite) return res.status(404).json({ message: 'Team not found' });

    const team = invite.members;
    const analysis = await analyzeTeamHealth(team);

    const allSkills = {};
    team.forEach(m => m.skills.forEach(s => {
      allSkills[s.name] = Math.max(allSkills[s.name] || 0, s.level);
    }));

    res.json({ analysis, members: team, skillCoverage: allSkills });
  } catch (err) {
    res.status(500).json({ message: 'Team health analysis failed', error: err.message });
  }
};
