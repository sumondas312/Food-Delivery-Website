const { ObjectId } = require("mongoose");
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: ObjectId,
      required: true,
      ref: 'user_master'
    },
    buyer_id: String,
    agent_id: String,
    user_role: {
      type: String,
      required: true
    },
    material_no: String,
    serial_no: {
      type: String,
      required: true
    },
    shade: String,
    delivery_period: String,
    ulc: {
      type: String,
      required: true
    },
    units: {
      type: String,
      required: true
    },
    season: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    status: String,
    ex_mill_price: String,
    booking_sub_category: {
      type: String,
      required: true
    },
    product_id: {
      type: ObjectId,
      required: true,
      ref: 'zsd_seas_mast'
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

module.exports = mongoose.model("cart", cartSchema, "cart");
