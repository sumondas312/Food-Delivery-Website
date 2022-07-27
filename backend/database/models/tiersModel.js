const mongoose = require('mongoose');

const tierSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    delete_tier_flg: {
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

module.exports = mongoose.model('rpp_tier_master', tierSchema, 'rpp_tier_master');