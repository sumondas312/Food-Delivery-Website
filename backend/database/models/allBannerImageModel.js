const mongoose = require("mongoose");

const exMillRangeSchema = new mongoose.Schema(
    {
        img: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        sub_type: {
            type: String,
            // required: true
        },
        is_deleted: {
            type: String,
            required: true,
            enum: ['n', 'y'],
            default: 'n'
        },
        status: {
            type: String,
            required: true,
            enum: ['Active', 'Inactive'],
            default: 'Active'
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

module.exports = mongoose.model("all_image", exMillRangeSchema);
