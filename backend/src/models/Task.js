const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema(
  { title: { type: String, required: true }, done: { type: Boolean, default: false } },
  { _id: true, timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ['task', 'bug', 'feature', 'improvement'],
      default: 'task',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'done', 'blocked'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date },
    completedAt: { type: Date },
    clientApproved: { type: Boolean, default: false },
    clientApprovedAt: { type: Date },
    subtasks: [subtaskSchema],
    attachments: [{ name: String, url: String, type: String, size: Number }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
