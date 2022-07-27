const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true
    },
    type: String,
    feedback: {
        type: Array,
        required: true
    }

},
    { timestamps: true }
)


module.exports = mongoose.model('feedback', feedbackSchema)