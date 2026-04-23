const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    techStack: [{ type: String, trim: true }],
    startDate: { type: Date, default: Date.now },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['planning', 'in-progress', 'testing', 'completed', 'on-hold'],
      default: 'planning',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    budget: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

projectSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Project', projectSchema);
