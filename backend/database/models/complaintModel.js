const mongoose = require('mongoose');
const { ObjectId } = require('mongoose');

const pdtSchema = new mongoose.Schema({
    ticket_no: {
        type: String,
        unique: true,
        required: true
    },
    description: String,
    file: String,
    selected_complaint: String,
    status: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        required: true
    },
    submitted_by: {
        type: ObjectId,
        required: true
    },
    user_type: {
        type: String,
        required: true
    },
}, {
    timestamps: true,
    toObject: {
        transform: function (doc, ret, options) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

module.exports = mongoose.model('complaint', pdtSchema, 'complaint');