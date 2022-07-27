const constants = require('../constants');
const { formatMongoData } = require('../helpers/dbHelper');
const Promote = require('../database/models/promoteModel');
const Questionnaire = require('../database/models/questionnaireModel');

// Promote Customer
module.exports.promotecustomer = async (req) => {
  let details = {};
  var promoteData = {};
  promoteData = {
    name: req.body.name,
    mobile: req.body.mobile,
  };
  try {
    let mobilenumber = await Promote.find({ mobile: req.body.mobile });
    console.log(mobilenumber);
    if (mobilenumber.length == 0) {
      const newPromoteCustomer = new Promote(promoteData);
      let promoteResult = await newPromoteCustomer.save();
      details.status = 200;
      details.message = 'Details store successfully';
      details.body = await formatMongoData(promoteResult);
      return details;
    } else {
      details.status = 202;
      details.message = 'Mobile number already exist';
      details.body = [];
      return details;
    }
  } catch (error) {
    console.log('Something went wrong', error);
    throw new Error(error);
  }
};




// Questionnaire
module.exports.questionnaire = async (req) => {
  var questionnaireData = {};
  let details = {};
  questionnaireData = {
    name: req.body.name,
    mobile: req.body.mobile,
    features: req.body.features,
    rating: req.body.rating,
    comment: req.body.comment,
  };
  try {
    const newquestionnaire = new Questionnaire(questionnaireData);
    let questionnaireResult = await newquestionnaire.save();
    if (questionnaireResult) {
      details.status = 200;
      details.message = 'Details store successfully';
      details.body = await formatMongoData(questionnaireResult);
      return details;
    } else {
      details.status = 202;
      details.message = 'Data store unsuccessfull';
      details.body = [];
      return details;
    }
  } catch (error) {
    console.log('Something went wrong', error);
    throw new Error(error);
  }
};
