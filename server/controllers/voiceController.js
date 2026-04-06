const User = require('../models/User');

// Simplified voice controller without S3 dependency
// Stores voice intro as base64 or external URL
exports.uploadVoice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { voiceUrl, duration } = req.body;
    await User.findByIdAndUpdate(userId, {
      voiceIntroUrl: voiceUrl,
      voiceIntroDuration: duration
    });
    res.json({ url: voiceUrl });
  } catch (err) {
    res.status(500).json({ message: 'Voice upload failed', error: err.message });
  }
};

exports.getVoice = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('voiceIntroUrl voiceIntroDuration');
    if (!user || !user.voiceIntroUrl) {
      return res.status(404).json({ message: 'No voice intro found' });
    }
    res.json({ url: user.voiceIntroUrl, duration: user.voiceIntroDuration });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get voice', error: err.message });
  }
};

exports.deleteVoice = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      voiceIntroUrl: null,
      voiceIntroDuration: null
    });
    res.json({ message: 'Voice intro deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
