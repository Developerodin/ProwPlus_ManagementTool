const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const c = require('../controllers/projectController');
const tasks = require('../controllers/taskController');
const comments = require('../controllers/commentController');

router.use(protect);

router.get('/stats', c.stats);
router.get('/activity', c.activity);
router.get('/', c.list);
router.post('/', requireRole('admin'), c.create);
router.get('/:id', c.getOne);
router.patch('/:id', requireRole('admin', 'team'), c.update);
router.delete('/:id', requireRole('admin'), c.remove);

// nested tasks under project
router.get('/:projectId/tasks', tasks.listByProject);
router.post('/:projectId/tasks', tasks.create);

module.exports = router;
