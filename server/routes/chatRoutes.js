const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getChatHistory, getPrefillMessages, copilotMessage } = require('../controllers/chatController');

router.get('/prefill/:targetId', auth, getPrefillMessages);
router.post('/copilot', auth, copilotMessage);
router.get('/:roomId', auth, getChatHistory);

module.exports = router;
