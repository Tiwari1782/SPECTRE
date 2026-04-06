const mongoose = require('mongoose');

const JoinRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const SentInviteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const TeamInviteSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, unique: true, required: true },
  teamName: { type: String, default: '' },
  description: { type: String, default: '' },
  hackathonId: { type: String },
  teamSlots: { type: Number, default: 4 },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinRequests: [JoinRequestSchema],
  sentInvites: [SentInviteSchema],
  isOpen: { type: Boolean, default: true },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TeamInvite', TeamInviteSchema);
