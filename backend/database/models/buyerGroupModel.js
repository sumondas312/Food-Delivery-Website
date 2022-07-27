const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
    {
        name: String,
        status: {
            type: String,
            required: true
        },
        delete_group_flg: {
            type: String,
            required: true
        },
        group_code: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        mobile: String,
        address1: String,
        address2: String,
        city: String,
        pincode: String,
        grp_buyer: String,
        spouse_name: String,
        buyer_no: String,
        zone: String,
        format_type: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true,
        toObject: {
            transform: function (doc, ret, options) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

module.exports = mongoose.model('rpp_buyer_group', groupSchema, 'rpp_buyer_group');