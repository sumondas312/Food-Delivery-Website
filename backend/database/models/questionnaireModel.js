
const string = require('@hapi/joi/lib/types/string');
const mongoose = require('mongoose');

const questionnaireSchema = new mongoose.Schema({
  name: String,
  mobile:String,
  features: String,
  rating: String,
  comment: String,
},
{timestamps: true}
);

module.exports = mongoose.model('questionnaire', questionnaireSchema);
