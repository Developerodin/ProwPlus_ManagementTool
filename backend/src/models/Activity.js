const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    // examples: project.created, task.status.changed, task.comment.added, task.approved
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
