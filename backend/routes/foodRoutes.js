const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const joiSchemaValidation = require('../middlewares/joiSchemaValidation');

router.post('/foodsignup', foodController.foodsignup);
router.post('/foodlogin', foodController.foodlogin);
router.post('/orders', foodController.orderBookingpdf);
module.exports = router;
