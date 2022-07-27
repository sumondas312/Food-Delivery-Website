const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const joiSchemaValidation = require('../middlewares/joiSchemaValidation');

router.post('/otplogin',
customerController.otplogin
)
router.post('/getdetails',
customerController.getdetails

)

router.post('/customerfilterfirst',
customerController.customerfilterfirst
)

router.post('/customerfilter',
customerController.customerfilter
)

router.post('/exportfilterecustomer',
customerController.exportfilterecustomer
)

module.exports = router;