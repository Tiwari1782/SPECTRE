const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getHackathons } = require('../controllers/hackathonController');

router.get('/', auth, getHackathons);

module.exports = router;
