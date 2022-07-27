const mongoose = require('mongoose');

const gmbFeedbackSchema = new mongoose.Schema({
    gmbfeedback: {
        type: Array,
        required: true
    }
},
    { timestamps: true }
)


module.exports = mongoose.model('gmb_feedback', gmbFeedbackSchema)