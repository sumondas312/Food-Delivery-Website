const mongoose = require('mongoose');
const { ObjectId } = require('mongoose');

const storeSchema = new mongoose.Schema({
  // customer_key: String,
  customer_no: {
    type: String,
    unique: true,
    required: true
  },
  customer_name: String,
  customer_email: String,
  agent_name: String,
  agent_agency: String,
  asm_name: String,
  rsm_name: String,
  zsm_name: String,
  nh_name: String,
  agent_email: String,
  asm_email: String,
  rsm_email: String,
  zsm_email: String,
  nh_email: String,

  format_type: String,
  sales_org_type: {
    type: String,
    enum: ['shirting', 'suiting', 'apparel'],
    required: true,
  },
  sales_org_no: {
    type: String,
    required: true
  },
  county_code: String,
  buyer_area_code: String,
  buyer_customer_no: String,
  buyer_city: String,
  buyer_name: String,
  buyer_id: {
    type: ObjectId,
    ref: 'user_master'
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

module.exports = mongoose.model('user_mapping', storeSchema, 'user_mapping');