const { ObjectId } = require("mongoose");
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    user_id: {
      type: ObjectId,
      required: true,
      ref: "user_master",
    },
    order_mid: {
      type: ObjectId,
      required: true,
      ref: "order",
    },
    user_role: String,
    buyer_id: {
      type: ObjectId,
      required: true,
      ref: "user_master",
    },
    season: {
      type: String,
      required: true,
    },
    material_no: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
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

module.exports = mongoose.model("confirm_order_map", itemSchema, "confirm_order_map");
