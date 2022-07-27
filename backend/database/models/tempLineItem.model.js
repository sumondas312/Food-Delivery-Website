const { ObjectId } = require('mongoose');
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    order_id: {
        type: String,
        required: true
    },
    material_no: {
        type: String,
        required: true
    },
    delivery_period: {
        type: String,
        required: true
    },
    ulc: {
        type: String,
        required: true
    },
    units: {
        type: String,
        required: true
    },
    shade: {
        type: String,
        required: true
    },
    serial_no: String,
    total_meter: String,
    // season: String,
    status: String,
    ex_mill_price: {
        type: String,
        required: true
    },
    product_id: {
        type: ObjectId,
        required: true,
        ref: 'zsd_seas_mast'
    },
    // collection_period: String,
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

module.exports = mongoose.model('temp_order_line_item', itemSchema);