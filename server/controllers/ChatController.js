const Message = require('../models/Message');
const User = require('../models/User');
const { ideaCopilot } = require('../services/groqService');

exports.getChatHistory = async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name role');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get chat history', error: err.message });
  }
};

exports.getPrefillMessages = async (req, res) => {
  try {
    const target = await User.findById(req.params.targetId);
    const user = await User.findById(req.user.userId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const sharedSkills = (user.skills || [])
      .filter(s => (target.skills || []).some(ts => ts.name === s.name))
      .map(s => s.name);

    const templates = [
      `Hey ${target.name}! I see we both know ${sharedSkills[0] || target.role}. Want to team up?`,
      `Hi! I'm a ${user.role} looking for a ${target.role} teammate. Interested?`,
      `DevMatch paired us at a high compatibility! Let's chat about hackathon ideas.`
    ];

    res.json({ templates });
  } catch (err) {
    res.status(500).json({ message: 'Prefill failed', error: err.message });
  }
};

exports.copilotMessage = async (req, res) => {
  try {
    const { messages, teamIds } = req.body;
    const team = await User.find({ _id: { $in: teamIds } });
    const teamContext = team.map(m => ({
      name: m.name,
      role: m.role,
      skills: m.skills.map(s => s.name),
      interest: m.projectInterest
    }));
    const reply = await ideaCopilot(messages, teamContext);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: 'Co-pilot failed', error: err.message });
  }
};