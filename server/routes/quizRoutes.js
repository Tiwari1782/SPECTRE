const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getQuiz, submitQuiz, getQuizResults } = require('../controllers/quizController');

router.get('/results/:userId', auth, getQuizResults);
router.get('/:skill', auth, getQuiz);
router.post('/:skill/submit', auth, submitQuiz);

module.exports = router;
