const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/taskController');
const comments = require('../controllers/commentController');

router.use(protect);

router.get('/mine', c.myTasks);
router.patch('/:id', c.update);
router.delete('/:id', c.remove);
router.post('/:id/approve', c.approve);

router.get('/:taskId/comments', comments.listByTask);
router.post('/:taskId/comments', comments.create);

module.exports = router;
