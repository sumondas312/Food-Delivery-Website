const mongoose = require('mongoose');
const { ObjectId } = require('mongoose');

const storeSchema = new mongoose.Schema({
  password: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  user_type: String,
  name: String,
  mobile: String,
  status: String,
  is_deleted: String,
  last_login: Date,
  customer_id: {
    type: String,
    unique: true,
    required: true
  },
  format_type: {
    type: String,
    required: true
  },
  rsm_id: ObjectId,
  national_id: ObjectId,
  zonal_id: ObjectId,
  asm_id: ObjectId,
  agent_id: ObjectId,
  // rsm_email: Array,
  // national_email: Array,
  // zonal_email: Array,
  // asm_email: Array,
  // agent_email: Array,
  // county_code: String,

  group_id: ObjectId,
  group_code: String,
  city: String,
  state: String,
  district: String,
  pincode: String,
  address: String,
  agent_county_code: String,
  multiple_user_login: {
    type: Boolean,
    required: true
  },
  multiple_access: Array,
  area_code: String,
  agent_agency: String,
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

module.exports = mongoose.model('user_master', storeSchema, 'user_master');