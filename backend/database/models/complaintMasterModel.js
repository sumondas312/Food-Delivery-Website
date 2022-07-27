const mongoose = require('mongoose');
const { ObjectId } = require('mongoose');

const pdtSchema = new mongoose.Schema({    
    complaint: String,
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

module.exports = mongoose.model('complaint_master', pdtSchema, 'complaint_master');