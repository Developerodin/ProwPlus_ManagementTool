const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const c = require('../controllers/userController');

router.use(protect, requireRole('admin'));

router.get('/stats', c.stats);
router.get('/', c.list);
router.post('/', c.create);
router.get('/:id', c.getOne);
router.patch('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
