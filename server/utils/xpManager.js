const User = require('../models/User');

const XP_THRESHOLDS = { Rookie: 0, Hacker: 100, Pro: 300, Legend: 700 };

exports.awardXP = async (userId, amount, reason) => {
  const user = await User.findById(userId);
  if (!user) return null;

  user.xp += amount;

  // Level up check
  for (const [level, threshold] of Object.entries(XP_THRESHOLDS).reverse()) {
    if (user.xp >= threshold) {
      user.level = level;
      break;
    }
  }

  // Badge award
  const badges = [];
  if (amount === 50 && reason === 'quiz') badges.push('verified_dev');
  if (reason === 'team_formed') badges.push('team_player');
  if (reason === 'showcase') badges.push('shipped_it');
  if (reason === 'profile_complete') badges.push('profile_star');
  if (reason === 'github_connected') badges.push('open_source');

  user.badges = [...new Set([...user.badges, ...badges])];
  await user.save();
  return { xp: user.xp, level: user.level, newBadges: badges };
};
