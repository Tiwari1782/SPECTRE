const router = require('express').Router();
const {
  sendOtp, verifyOtp, devLogin, createInvite, getInvite, joinViaInvite,
  requestToJoin, acceptRequest, rejectRequest, browseOpenTeams, updateTeam, addMemberToTeam,
  inviteUserToTeam, acceptIncomingInvite, rejectIncomingInvite
} = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/dev-login', devLogin);

// Team & Invite
router.post('/invite/create', auth, createInvite);
router.get('/invite/:token', getInvite);
router.post('/invite/:token/join', joinViaInvite);

// Join Request System (Users -> Team)
router.get('/teams/browse', auth, browseOpenTeams);
router.post('/teams/:teamId/request', auth, requestToJoin);
router.post('/teams/:teamId/request/:requestId/accept', auth, acceptRequest);
router.post('/teams/:teamId/request/:requestId/reject', auth, rejectRequest);
router.patch('/teams/:teamId', auth, updateTeam);
router.post('/teams/:teamId/add-member', auth, addMemberToTeam);

// Manual Invites System (Team -> Users)
router.post('/teams/:teamId/invite-user', auth, inviteUserToTeam);
router.post('/teams/:teamId/invites/:inviteId/accept', auth, acceptIncomingInvite);
router.post('/teams/:teamId/invites/:inviteId/reject', auth, rejectIncomingInvite);

module.exports = router;
