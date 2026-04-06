const Showcase = require('../models/Showcase');
const { awardXP } = require('../utils/xpManager');

exports.publishProject = async (req, res) => {
  try {
    const { teamName, members, hackathonName, projectName, description, githubUrl, demoUrl, techStack } = req.body;
    const project = await Showcase.create({
      teamName, members, hackathonName, projectName, description, githubUrl, demoUrl, techStack
    });

    // Award XP to all members
    if (members && members.length > 0) {
      await Promise.all(members.map(id => awardXP(id, 25, 'showcase')));
    }

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Failed to publish project', error: err.message });
  }
};

exports.getShowcase = async (req, res) => {
  try {
    const projects = await Showcase.find()
      .sort({ upvotes: -1 })
      .populate('members', 'name role xp level');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get showcase', error: err.message });
  }
};

exports.upvoteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const project = await Showcase.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.upvotedBy.includes(userId)) {
      return res.status(400).json({ message: 'Already upvoted' });
    }

    project.upvotes += 1;
    project.upvotedBy.push(userId);
    await project.save();

    // Award XP to project members
    await Promise.all(project.members.map(id => awardXP(id, 5, 'upvote')));

    res.json({ upvotes: project.upvotes });
  } catch (err) {
    res.status(500).json({ message: 'Upvote failed', error: err.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const top = await Showcase.find()
      .sort({ upvotes: -1 })
      .limit(10)
      .populate('members', 'name role xp level badges');
    res.json(top);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get leaderboard', error: err.message });
  }
};
