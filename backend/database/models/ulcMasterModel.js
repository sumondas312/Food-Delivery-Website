const mongoose = require('mongoose');

const pdtSchema = new mongoose.Schema({
    ulc: {
        type: String,
        unique: true,
        required: true
    },
    meters: String,
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

module.exports = mongoose.model('ulc_master', pdtSchema, 'ulc_master');