const express = require('express');
const router = express.Router();
const promoteController = require('../controllers/promoteController');
const joiSchemaValidation = require('../middlewares/joiSchemaValidation');
const promoteSchema = require("../apiSchemas/promoteSchema");

router.post('/promotecustomer', promoteController.promotecustomer);
router.post('/questionnaire', joiSchemaValidation.validateBody(promoteSchema.questionnaire), promoteController.questionnaire);

module.exports = router;
