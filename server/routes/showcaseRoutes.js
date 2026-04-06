const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { publishProject, getShowcase, upvoteProject, getLeaderboard } = require('../controllers/showcaseController');

router.get('/leaderboard', auth, getLeaderboard);
router.post('/', auth, publishProject);
router.get('/', auth, getShowcase);
router.post('/:id/upvote', auth, upvoteProject);

module.exports = router;
