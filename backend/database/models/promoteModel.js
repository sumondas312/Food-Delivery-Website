
const mongoose = require('mongoose');

const promoteSchema = new mongoose.Schema({
  name: String,
  mobile: String,
},
{timestamps: true}
);

module.exports = mongoose.model('promote', promoteSchema);
