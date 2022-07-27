const mongoose = require('mongoose');
const { ObjectId } = require('mongoose');

const dealerPointRollupsSchema = new mongoose.Schema({
  buyer_id: {
    type: ObjectId,
    required: true
  },
  customer_id: {
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
  },
  bonus_points: {
    type: Number,
    required: true
  },
  final_tier: String,
  rewards_info_id: String,
  format_type: {
    type: String,
    required: true
  },
  pending_points: {
    type: Number,
    required: true
  },
  total_achivement: String,
  delete_point_rollups_flg: {
    type: String,
    required: true
  },
}, {
  timestamps: true,
  toObject: {
    transform: function (doc, ret, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = mongoose.model('rpp_buyer_points_roll_ups', dealerPointRollupsSchema, 'rpp_buyer_points_roll_ups');