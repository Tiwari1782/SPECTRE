const mongoose = require('mongoose');

const ShowcaseSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  hackathonName: { type: String },
  projectName: { type: String, required: true },
  description: { type: String },
  githubUrl: { type: String },
  demoUrl: { type: String },
  techStack: [String],
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Showcase', ShowcaseSchema);
