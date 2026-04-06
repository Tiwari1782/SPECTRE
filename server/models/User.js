//Codeconst mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, unique: true, required: true },
  email: { type: String, trim: true },

  skills: [
    {
      name: { type: String },
      level: { type: Number, min: 1, max: 5, default: 3 },
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date }
    }
  ],

  role: {
    type: String,
    enum: ['Frontend', 'Backend', 'Full Stack', 'ML Engineer', 'UI/UX Designer', 'Mobile Dev', 'DevOps'],
    default: 'Full Stack'
  },

  experience: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  availability: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Flexible'],
    default: 'Full-time'
  },
  goals: {
    type: String,
    enum: ['Win', 'Learn', 'Network', 'Build'],
    default: 'Build'
  },
  projectInterest: {
    type: String,
    enum: ['Web App', 'AI Project', 'Blockchain', 'Mobile App', 'Open'],
    default: 'Open'
  },
  workingStyle: {
    type: String,
    enum: ['Fast-ship', 'Perfectionist', 'Async', 'In-person'],
    default: 'Fast-ship'
  },

  // Availability Heatmap
  availabilityGrid: {
    type: Map,
    of: [Number],
    default: {}
  },

  // Blind Matching
  blindMode: { type: Boolean, default: false },

  // Voice Intro
  voiceIntroUrl: { type: String },
  voiceIntroDuration: { type: Number },

  // GitHub
  githubUsername: { type: String },
  githubData: {
    languages: [String],
    topRepos: [String],
    contributions: Number,
    profileUrl: String
  },

  assignedRole: { type: String },

  // XP & Gamification
  xp: { type: Number, default: 0 },
  level: {
    type: String,
    enum: ['Rookie', 'Hacker', 'Pro', 'Legend'],
    default: 'Rookie'
  },
  hackathonsAttended: { type: Number, default: 0 },
  badges: [{ type: String }],

  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);