const mongoose = require('mongoose');

const groupPointRollupsSchema = new mongoose.Schema({
    group_id: {
        type: String,
        required: true
    },
    group_code: {
        type: String,
        required: true
    },
    earn_points: {
        type: Number,
        required: true
    },
    balance_points: {
        type: Number,
        required: true
    },// bal_points
    bonus_points: {
        type: Number,
        required: true
    },
    final_tier: String,
    tier_upgrade_date: Date,
    rewards_info_id: String,
    tier_info: {
        type: String,
        required: true
    }, // tier_info_id
    format_type: {
        type: String,
        required: true
    }, //dealer_type_id
    pending_points: Number,
    total_achivement: String,
    delete_group_rollups_flg: {
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

module.exports = mongoose.model('rpp_buyer_group_points_roll_up', groupPointRollupsSchema, 'rpp_buyer_group_points_roll_up');