const { ObjectId } = require('mongoose');
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({    
    description: {
        type: String,
        required: true
    },
    request_no: {
        type: String,
        unique: true,
        required: true,
    },
    submitted_by: {
        type: ObjectId,
        required: true
    },
    user_type: {
        type: String,
        required: true
    }
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

module.exports = mongoose.model('profile_update_request', itemSchema);