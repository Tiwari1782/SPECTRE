const ROLE_WEIGHT = 20;
const GOAL_WEIGHT = 15;
const AVAIL_WEIGHT = 10;
const SKILL_OVERLAP_PENALTY = -5;
const DOMAIN_BONUS = 25;
const VIBE_BONUS = 20;
const VERIFIED_SKILL_BONUS = 10;
const AVAILABILITY_OVERLAP_BONUS = 15;

function calculateMatchScore(user, other) {
  let score = 0;
  const breakdown = {};

  // 1. Skill overlap
  const userSkillNames = (user.skills || []).map(s => s.name);
  const otherSkillNames = (other.skills || []).map(s => s.name);
  const overlap = userSkillNames.filter(s => otherSkillNames.includes(s));
  const overlapScore = overlap.length <= 2
    ? overlap.length * 8
    : overlap.length * SKILL_OVERLAP_PENALTY;
  score += overlapScore;
  breakdown.skillOverlap = overlapScore;

  // 2. Verified skills bonus
  const verifiedCount = (other.skills || []).filter(s => s.verified).length;
  const verifiedBonus = Math.min(verifiedCount * VERIFIED_SKILL_BONUS, 20);
  score += verifiedBonus;
  breakdown.verifiedSkills = verifiedBonus;

  // 3. Complementary roles
  if (user.role !== other.role) {
    score += ROLE_WEIGHT;
    breakdown.roleComplement = ROLE_WEIGHT;
  }

  // 4. Goals alignment
  if (user.goals === other.goals) {
    score += GOAL_WEIGHT;
    breakdown.goalsMatch = GOAL_WEIGHT;
  }

  // 5. Availability match
  if (user.availability === other.availability) {
    score += AVAIL_WEIGHT;
    breakdown.availabilityMatch = AVAIL_WEIGHT;
  }

  // 6. Availability heatmap overlap
  const userGrid = user.availabilityGrid instanceof Map
    ? Object.fromEntries(user.availabilityGrid)
    : (user.availabilityGrid || {});
  const otherGrid = other.availabilityGrid instanceof Map
    ? Object.fromEntries(other.availabilityGrid)
    : (other.availabilityGrid || {});

  if (Object.keys(userGrid).length && Object.keys(otherGrid).length) {
    let overlapHours = 0;
    for (const [day, hours] of Object.entries(userGrid)) {
      const otherHours = otherGrid[day] || [];
      overlapHours += (hours || []).filter(h => otherHours.includes(h)).length;
    }
    const heatmapBonus = Math.min(overlapHours * 2, AVAILABILITY_OVERLAP_BONUS);
    score += heatmapBonus;
    breakdown.heatmapOverlap = heatmapBonus;
  }

  // 7. Domain match
  if (user.projectInterest === other.projectInterest ||
      user.projectInterest === 'Open' ||
      other.projectInterest === 'Open') {
    score += DOMAIN_BONUS;
    breakdown.domainMatch = DOMAIN_BONUS;
  }

  // 8. Working style (vibe match)
  if (user.workingStyle === other.workingStyle) {
    score += VIBE_BONUS;
    breakdown.vibeMatch = VIBE_BONUS;
  }

  const percentage = Math.min(Math.round((score / 120) * 100), 99);
  return { score, percentage, breakdown, sharedSkills: overlap };
}

function assignRole(user) {
  const skillNames = (user.skills || []).map(s => s.name.toLowerCase());
  if (skillNames.some(s => ['tensorflow', 'pytorch', 'ml', 'python', 'sklearn'].includes(s))) return 'ML Engineer';
  if (skillNames.some(s => ['react', 'vue', 'angular', 'html', 'css', 'tailwind'].includes(s))) return 'Frontend Lead';
  if (skillNames.some(s => ['node', 'express', 'django', 'spring', 'postgresql', 'mongodb'].includes(s))) return 'Backend Lead';
  if (skillNames.some(s => ['figma', 'ui', 'ux', 'design', 'adobe'].includes(s))) return 'UI/UX Designer';
  if (skillNames.some(s => ['flutter', 'react native', 'swift', 'kotlin'].includes(s))) return 'Mobile Dev';
  return user.role || 'Full Stack';
}

module.exports = { calculateMatchScore, assignRole };
