const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { uploadVoice, getVoice, deleteVoice } = require('../controllers/voiceController');

router.post('/upload', auth, uploadVoice);
router.get('/:userId', auth, getVoice);
router.delete('/', auth, deleteVoice);

module.exports = router;
