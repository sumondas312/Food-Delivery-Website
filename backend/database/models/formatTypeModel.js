const mongoose = require('mongoose');

const dealerTypeSchema = new mongoose.Schema({
    title: String,
    status: String,
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

module.exports = mongoose.model('rpp_format_type_master', dealerTypeSchema, 'rpp_format_type_master');