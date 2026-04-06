const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getMatches, getMatchExplanation, getTeamSuggestion, getTeamHealth } = require('../controllers/matchController');

router.get('/team-health/:teamId', auth, getTeamHealth);
router.get('/team/:userId', auth, getTeamSuggestion);
router.get('/explain/:userId/:targetId', auth, getMatchExplanation);
router.get('/:userId', auth, getMatches);

module.exports = router;
