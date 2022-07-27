const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const joiSchemaValidation = require('../middlewares/joiSchemaValidation');
const ComplaintSchema = require('../apiSchemas/complaintSchema');
const tokenValidation = require('../middlewares/tokenValidation');
const multer = require('multer');

const upload_complaint = multer({ dest: './uploads/complaints/' });

router.post('/insert',
    upload_complaint.single('file'),
    tokenValidation.validateToken,
    complaintController.insertComplaint
);
//joiSchemaValidation.validateBody(ComplaintSchema.insert),

module.exports = router;
