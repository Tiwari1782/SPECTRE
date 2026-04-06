const mongoose = require('mongoose');

const QuizResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  score: { type: Number },
  passed: { type: Boolean },
  timeTaken: { type: Number },
  attemptedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', QuizResultSchema);
