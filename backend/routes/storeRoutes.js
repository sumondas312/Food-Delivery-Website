const express = require('express');
const router = express.Router();

const storeController = require('../controllers/storeController');
const storeSchema = require('../apiSchemas/storeSchema')
const joiSchemaValidation = require('../middlewares/joiSchemaValidation');

// router.post('/storesearch',
//     joiSchemaValidation.validateBody(storeSchema.storesearch),
//     storeController.storesearch
// )

router.post('/storesearch',
    storeController.storesearch
)

module.exports = router;