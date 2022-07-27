
const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  order: String,
  quantity: String,
  date: String,
  time: String,
  address:String
},
{timestamps: true}
);

module.exports = mongoose.model('food', foodSchema);
