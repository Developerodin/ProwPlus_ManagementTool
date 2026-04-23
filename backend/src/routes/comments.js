const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/commentController');

router.use(protect);
router.delete('/:id', c.remove);

module.exports = router;
