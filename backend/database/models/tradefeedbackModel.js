const mongoose = require('mongoose');

const tradeFeedbackSchema = new mongoose.Schema({
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


module.exports = mongoose.model('tradeFeedback', tradeFeedbackSchema)