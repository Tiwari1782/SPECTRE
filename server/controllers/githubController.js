const axios = require('axios');
const User = require('../models/User');
const { awardXP } = require('../utils/xpManager');

exports.fetchGitHub = async (req, res) => {
  const { username } = req.params;
  try {
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    const [profileRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, { headers, timeout: 10000 }),
      axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, { headers, timeout: 10000 })
    ]);

    const repos = reposRes.data;
    const languageMap = {};

    await Promise.all(repos.map(async (repo) => {
      try {
        const langRes = await axios.get(repo.languages_url, { headers, timeout: 5000 });
        Object.keys(langRes.data).forEach(lang => {
          languageMap[lang] = (languageMap[lang] || 0) + langRes.data[lang];
        });
      } catch (e) {
        // Skip individual repo language fetch failures
      }
    }));

    const topLanguages = Object.keys(languageMap)
      .sort((a, b) => languageMap[b] - languageMap[a])
      .slice(0, 6);

    const githubData = {
      languages: topLanguages,
      topRepos: repos.slice(0, 3).map(r => r.name),
      contributions: profileRes.data.public_repos,
      profileUrl: profileRes.data.html_url
    };

    await User.findByIdAndUpdate(req.user.userId, {
      githubUsername: username,
      githubData
    });

    
    // Award XP
    await awardXP(req.user.userId, 15, 'github_connected');

    res.json({ githubData, detectedSkills: topLanguages });
  } catch (err) {
    res.status(500).json({ message: 'GitHub fetch failed', error: err.message });
  }
};
