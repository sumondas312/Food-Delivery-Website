const mongoose = require('mongoose');
const { ObjectId } = require('mongoose');

const dealerPointSchema = new mongoose.Schema({
  buyer_id: {
    type: ObjectId,
    required: true
  },
  customer_id: {//login_id
    type: String,
    required: true
  },
  point: {
    type: Number,
    required: true
  },
  applied_tier: String,// 1,2,3
  point_type: String,// earn_point = 3( default)
  point_issue_date: Date,
  point_expiry_date: Date,// add 1yr from start date
  point_expired_flg: String,
  remarks: String,
  delete_point_flg: {
    type: String,
    required: true
  },
  order_id: {
    type: String,
    required: true
  }
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

module.exports = mongoose.model('rpp_buyer_point', dealerPointSchema, 'rpp_buyer_point');