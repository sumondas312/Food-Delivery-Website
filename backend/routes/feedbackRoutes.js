const express = require("express");
const router = express.Router();
const feedbackController = require('../controllers/feedbackController')
const joiSchemaValidation = require('../middlewares/joiSchemaValidation')
const feedbackSchema = require('../apiSchemas/feedbackSchema')

router.post('/prefeedback',
    feedbackController.prefeedback
)

router.post('/postfeedback',
    feedbackController.postFeedback
)
router.get('/getallfeedbacks',
    feedbackController.getallfeedbacks
)
router.get('/export',
    feedbackController.export
)

router.post('/tradefeedback',
feedbackController.tradefeedback
)

router.post('/tradefeedbacksuiting',
feedbackController.tradefeedbacksuiting
)


router.post('/gmbfeedback',
feedbackController.gmbfeedback
)


router.get('/exporttradefeedback',
feedbackController.exporttradefeedback
)

router.get(
    "/exporttradefeedbacksuiting",
    feedbackController.exporttradefeedbacksuiting
  );

router.post('/apparelfeedback',
feedbackController.apparelfeedback
)

module.exports = router;