const { generateQuiz } = require('../services/groqService');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');
const { awardXP } = require('../utils/xpManager');

// Cache quizzes briefly so submit can reference the same questions
const quizCache = new Map();

exports.getQuiz = async (req, res) => {
  const { skill } = req.params;
  try {
    const quiz = await generateQuiz(skill);
    // Cache for this user+skill
    const cacheKey = `${req.user.userId}_${skill}`;
    quizCache.set(cacheKey, quiz);
    setTimeout(() => quizCache.delete(cacheKey), 10 * 60 * 1000); // 10 min TTL

    // Strip correct answers before sending
    const sanitized = quiz.questions.map(({ correctIndex, explanation, ...q }) => q);
    res.json({ skill, questions: sanitized });
  } catch (err) {
    res.status(500).json({ message: 'Quiz generation failed', error: err.message });
  }
};

exports.submitQuiz = async (req, res) => {
  const { skill } = req.params;
  const { answers, timeTaken } = req.body;
  const userId = req.user.userId;

  try {
    const cacheKey = `${userId}_${skill}`;
    let quiz = quizCache.get(cacheKey);

    if (!quiz) {
      // Regenerate if cache expired (edge case)
      quiz = await generateQuiz(skill);
    }

    const correct = quiz.questions.filter((q, i) => q.correctIndex === answers[i]).length;
    const score = Math.round((correct / 5) * 100);
    const passed = score >= 60;

    await QuizResult.create({ user: userId, skill, score, passed, timeTaken });

    if (passed) {
      await User.findByIdAndUpdate(userId, {
        $set: {
          'skills.$[elem].verified': true,
          'skills.$[elem].verifiedAt': new Date()
        }
      }, { arrayFilters: [{ 'elem.name': skill }] });

      await awardXP(userId, 50, 'quiz');
    }

    quizCache.delete(cacheKey);
    res.json({ score, passed, correct, total: 5, xpEarned: passed ? 50 : 0 });
  } catch (err) {
    res.status(500).json({ message: 'Quiz submission failed', error: err.message });
  }
};

exports.getQuizResults = async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.params.userId }).sort({ attemptedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get results', error: err.message });
  }
};
