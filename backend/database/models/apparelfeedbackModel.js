
const mongoose = require('mongoose');

const apparelFeedbackSchema = new mongoose.Schema({
    phone: Number,
    question1:String,
    answer1:String,
    question2:String,
    answer2:String,
    question3:String,
    answer3:String,
    question4:String,
    answer4:String,
    question5:String,
    answer5:String,
    question6:String,
    answer6:String,
    question7:String,
    answer7:String,
    question8:String,
    answer8:String,
    question9:String,
    answer9:String,
    question10:String,
    answer10:String,
    question11:String,
    answer11:String,
    comment:String
},
{timestamps: true}
);

module.exports = mongoose.model('apparel_feedback', apparelFeedbackSchema,'apparel_feedback');
