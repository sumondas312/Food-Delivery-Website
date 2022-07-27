const { defaultServerResponse } = require('../constants');
const constants = require('../constants');
const promoteservice = require('../services/promoteservice');
const axios = require('axios');

const getData = async (trackingConfig) => {
  try {
    const response = await axios(trackingConfig);
    let res = { status: true, data: response.data.message };
    console.log(res);
    return res;
  } catch (error) {
    var message = '';
    for (let i in error.response.data) {
      message += (message ? ', ' : '') + JSON.stringify(error.response.data[i]);
    }
    let res = { status: false, data: message };
    return res;
  }
};

module.exports.promotecustomer = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    const responseFromService = await promoteservice.promotecustomer(req);
    if (responseFromService.status == 200) {
      let message;
      let otp = '853587';
      message = `Use ${otp} as your verification code on RaymondMart. The OTP expires within 10 minutes - Raymond Limited`;
      let postData = {
        mobileTerminate: {
          destination: {
            address: '91' + req.body.mobile,
          },
          source: {
            ton: 5,
            address: 'RAYMND',
          },
          message: {
            content: message,
            type: 'text',
            mlc: 'segment',
          },
        },
      };
      let otpConfig = {
        url: 'sms/v4/mt',
        method: 'post',
        baseURL: process.env.openmarket_api_url,
        headers: { 'content-type': 'application/json', Authorization: 'Basic ' + process.env.openmarket_auth_key },
        data: JSON.stringify(postData),
      };
      await getData(otpConfig);
    }
    response.status = responseFromService.status;
    response.message = responseFromService.message;
    response.body = responseFromService.body;
  } catch (err) {
    console.log('Something went wrong', err);
    response.message = err.message;
  }
  return res.status(response.status).send(response);
};

module.exports.questionnaire = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  // const url_parts = url.parse(req.url, true);
  // const url_string = url_parts.search;
  // const urlParams = new URLSearchParams(url_string);
  // const name = urlParams.get('name');
  // req.body.name = name;
  try {
    const responseFromService = await promoteservice.questionnaire(req);
    console.log(responseFromService);
    response.status = responseFromService.status;
    response.message = responseFromService.message;
    response.body = responseFromService.body;
  } catch (err) {
    console.log('Something went wrong', err);
    response.message = err.message;
  }
  return res.status(response.status).send(response);
};
