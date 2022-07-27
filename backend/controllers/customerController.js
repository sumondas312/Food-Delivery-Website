const { defaultServerResponse } = require('../constants');
const constants = require('../constants');
const customerService = require('../services/customerService');
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

module.exports.otplogin = async (req, res) => {
  let response = { ...defaultServerResponse };
  try {
    const { mobile } = req.body;
    let responseFromService = await customerService.otplogin({ mobile });
    let message;

    if (responseFromService.status) {
      message = `Use ${responseFromService.data.otp} as your verification code on RaymondMart. The OTP expires within 10 minutes - Raymond Limited`;
    }
    console.log(message);

    if (responseFromService.status == 200) {
      let postData = {
        mobileTerminate: {
          destination: {
            address: '91' + mobile,
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
      console.log(`Otp sent to ${mobile} --  ${responseFromService.data.mobile}`);

      response.status = 200;
      response.message = `Otp sent to ${mobile}`;
      response.body = { encInfo: `Otp sent to ${mobile} : ${responseFromService.data.otp}` };
    } else if (responseFromService.status == 202) {
      response.status = responseFromService.status;
      response.message = responseFromService.message;
    }
  } catch (err) {
    console.log('Something went wrong: customerController/otplogin', err);
    response.message = err.message;
  }
  return res.status(response.status).send(response);
};

module.exports.getdetails = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    const responseFromService = await customerService.getdetails(req.body);
    console.log(responseFromService);
    if (responseFromService.status == 200) {
      response.status = responseFromService.status;
      response.message = 'Customer details fetch successfully';
      response.body = responseFromService.body;
    } else if (responseFromService.status == 202) {
      response.status = responseFromService.status;
      response.message = 'Invalid Otp';
      response.body = responseFromService.body;
    }
  } catch (err) {
    console.log('Something went wrong: feedbackController/tradefeedback', err);
    response.message = err.message;
  }
  return res.status(response.status).send(response);
};

module.exports.customerfilter = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    const responseFromService = await customerService.customerfilter(req.body);
    response.status = 200;
    response.message = 'Success';
    response.body = responseFromService;
  } catch (err) {
    console.log('Something went wrong: feedbackController/tradefeedback', err);
    response.message = err.message;
  }
  return res.status(response.status).send(response);
};

module.exports.customerfilterfirst = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    const responseFromService = await customerService.customerfilterfirst(req.body);
    response.status = 200;
    response.message = 'Success';
    response.body = responseFromService;
  } catch (err) {
    console.log('Something went wrong: feedbackController/tradefeedback', err);
    response.message = err.message;
  }
  return res.status(response.status).send(response);
};

module.exports.exportfilterecustomer = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    const responseFromService = await customerService.exportfilterecustomer(req.body);
    response.status = 200;
    response.message = 'Success';
    response.body = responseFromService;
  } catch (err) {
    console.log('Something went wrong: feedbackController/tradefeedback', err);
    response.message = err.message;
  }
  return res.status(response.status).send(response);
};
