const express = require('express');
const router = express.Router();
const authMiddleware = require('../auth/authMiddleware');
const { getSwappableSlots, createSwapRequest, listSwapRequests, respondToSwapRequest } = require('../controllers/swapsController');

router.use(authMiddleware);

router.get('/swappable-slots', getSwappableSlots);
router.post('/swap-request', createSwapRequest);
router.get('/swap-requests', listSwapRequests);
router.post('/swap-response/:requestId', respondToSwapRequest);

module.exports = router;
