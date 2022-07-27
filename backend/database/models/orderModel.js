const { ObjectId } = require('mongoose');
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true,
        ref: 'user_master'
    },
    order_id: {
        type: String,
        unique: true,
        required: true
    },
    user_role: String,
    agent_id: {
        type: ObjectId,
        ref: 'user_master'
        //// required: true
    },
    buyer_id: {
        type: ObjectId,
        required: true,
        ref: 'user_master'
    },
    rsm_id: {
        type: ObjectId,
        ref: 'user_master'
    },
    asm_id: {
        type: ObjectId,
        ref: 'user_master'
    },
    national_id: {
        type: ObjectId,
        ref: 'user_master'
    },
    zonal_id: {
        type: ObjectId,
        ref: 'user_master'
    },
    // total_amount: {
    //     type: String,
    //     required: true
    // },
    payment_status: {
        type: String,
        required: true
    },
    payment_method: {
        type: String,
        required: true
    },
    season: {
        type: String,
        required: true
    },
    status: String,
    category: {
        type: String,
        required: true
    },
    total_units: {
        type: String,
        required: true
    },
    total_meters: {
        type: String,
        required: true
    },
    exMillPrice: {
        type: String,
        required: true
    },
    total_value: {
        type: String,
        required: true
    },
    area_code: {
        type: String,
        required: true
    },
    booking_sub_category: {
        type: String,
        required: true
    },
    expected_delivery_date: {
        type: Date,
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

module.exports = mongoose.model('order', itemSchema);