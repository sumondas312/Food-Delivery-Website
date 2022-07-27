const { defaultServerResponse } = require('../constants');
const constants = require('../constants');
const foodService = require('../services/foodService');

module.exports.foodsignup = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    const responseFromService = await foodService.foodsignup(req.body);
    response.status = 200;
    response.message = constants.userMessage.SIGNUP_SUCCESS;
    response.body = responseFromService;
  } catch (error) {
    console.log('Something went wrong: Controller: signup', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

module.exports.foodlogin = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    const responseFromService = await foodService.foodlogin(req.body);
    response.status = 200;
    response.message = constants.userMessage.SIGNUP_SUCCESS;
    response.body = responseFromService;
  } catch (error) {
    console.log('Something went wrong: Controller: signup', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

//Order booking pdf
module.exports.orderBookingpdf = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let data = await foodService.orderBookingpdf(req);
    if (data) {
      response.status = 200;
      response.message = constants.orderMessage.DOWNLOADED;
      response.body = {
        link: process.env.MEDIA_PATH2 + data,
      };
    } else {
      response.status = 202;
      response.message = 'Pdf is not created';
      response.body = {};
    }
  } catch (error) {
    console.log('Something went wrong', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};
