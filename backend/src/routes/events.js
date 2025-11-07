const express = require('express');
const router = express.Router();
const authMiddleware = require('../auth/authMiddleware');
const { getMyEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventsController');

router.use(authMiddleware);

router.get('/', getMyEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
