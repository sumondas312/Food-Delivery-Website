const mongoose = require('mongoose');

const rewardsSchema = new mongoose.Schema({

    tier_info: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    description2: String,
    image: String,
    terms_and_conditions: String,
    start_value: {
        type: Number,
        required: true
    },
    end_value: {
        type: Number,
        required: true
    },
    additional_reward: String,
    delete_rewards_flg: {
        type: String,
        required: true
    },
    format_type: {
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

module.exports = mongoose.model('rpp_reward_master', rewardsSchema, 'rpp_reward_master');