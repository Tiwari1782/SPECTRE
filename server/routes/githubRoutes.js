const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { fetchGitHub } = require('../controllers/githubController');

router.get('/:username', auth, fetchGitHub);

module.exports = router;
