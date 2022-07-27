const mongoose = require('mongoose');

const fooduserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

module.exports = mongoose.model('food_user', fooduserSchema,'food_user');