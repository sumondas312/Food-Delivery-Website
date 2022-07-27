const mongoose = require('mongoose');

const exMillRangeSchema = new mongoose.Schema({
    start_value: {
        type: Number,
        required: true
    },
    end_value: {
        type: Number,
        required: true
    },
    points_per_meter: {
        type: Number,
        required: true
    },
    format_type: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    delete_ex_mill_flg: {
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

module.exports = mongoose.model('rpp_ex_mill_range_master', exMillRangeSchema, 'rpp_ex_mill_range_master');