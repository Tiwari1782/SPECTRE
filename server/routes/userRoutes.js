const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const {
  createOrUpdateProfile, getMe, getUserById,
  saveAvailability, toggleBlindMode, getAllUsers, getMyTeams,
  getDevelopers, getIncomingInvites
} = require('../controllers/userController');

router.post('/profile', auth, createOrUpdateProfile);
router.get('/me', auth, getMe);
router.get('/all', auth, getAllUsers);
router.get('/developers', auth, getDevelopers);
router.get('/incoming-invites', auth, getIncomingInvites);
router.get('/my-teams', auth, getMyTeams);
router.get('/:id', auth, getUserById);
router.post('/availability', auth, saveAvailability);
router.patch('/blind-mode', auth, toggleBlindMode);

module.exports = router;
