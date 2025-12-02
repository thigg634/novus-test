// ==================== routes/bookingRoutes.js ====================
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { bookingValidation } = require('../middleware/validation');

router.get('/available-slots', bookingController.getAvailableSlots);
router.post('/', bookingValidation, bookingController.createBooking);
router.get('/test',bookingController.testemail );

module.exports = router;