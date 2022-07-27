
const express = require('express');
const router = express.Router();
const reportController = require("../controllers/reportController");
const joiSchemaValidation = require('../middlewares/joiSchemaValidation');

router.get("/orderbookingreport",reportController.orderBookingReportpdf);
module.exports = router;