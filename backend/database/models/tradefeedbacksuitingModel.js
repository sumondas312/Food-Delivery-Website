const mongoose = require('mongoose');

const tradeFeedbackSuitingSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true
    },
    tradefeedbacks: {
        type: Array,
        required: true
    },
    comment:String

},
    { timestamps: true }
)


module.exports = mongoose.model('trade_feedback_suiting', tradeFeedbackSuitingSchema,'trade_feedback_suiting')