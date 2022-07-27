const constants = require('../constants');
const feedbackService = require('../services/feedbackService');
var url = require('url')


module.exports.prefeedback = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        const responseFromService = await feedbackService.prefeedback(req);
        response.status = 200;
        response.message = constants.feedbackMessage.FEEDBACK_SUBMIT_SUCCESS;
        response.body = responseFromService;

        // console.log(constants.feedbackMessage.FEEDBACK_SUBMIT_SUCCESS);
    }
    catch (err) {
        console.log('Something went wrong: feedbackController/prefeedback', err);
        response.message = err.message;
    }
    return res.status(response.status).send(response);
}


module.exports.postFeedback = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        const responseFromService = await feedbackService.postFeedback(req);
        response.status = 200;
        response.message = constants.feedbackMessage.FEEDBACK_SUBMIT_SUCCESS;
        response.body = responseFromService;

        // console.log(constants.feedbackMessage.FEEDBACK_SUBMIT_SUCCESS);
    }

    catch (err) {
        console.log('Something went wrong: feedbackController/postfeedback', err);
        response.message = err.message;
    }
    return res.status(response.status).send(response);
}

module.exports.getallfeedbacks = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        var url_parts = url.parse(req.url, true);
        var url_string = url_parts.search;
        const urlParams = new URLSearchParams(url_string);
        const phone = urlParams.get('phone');
        req.phone = phone;

        const responseFromService = await feedbackService.getallfeedbacks(req);
        response.status = 200;
        response.message = constants.feedbackMessage.FEEDBACK_FETCH_SUCCESS;
        response.body = responseFromService;

        // console.log(constants.feedbackMessage.FEEDBACK_FETCH_SUCCESS);
    }
    catch (err) {
        console.log('Something went wrong: feedbackController/getallfeedbacks', err);
        response.message = err.message;
    }
    return res.status(response.status).send(response);
}

module.exports.export = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        var url_parts = url.parse(req.url, true);
        var url_string = url_parts.search;
        const urlParams = new URLSearchParams(url_string);
        const phone = urlParams.get('phone');
        req.phone = phone;

        const responseFromService = await feedbackService.export(req);
        response.status = 200;
        response.message = constants.feedbackMessage.FEEDBACK_FILE_CREATED;
        response.body = responseFromService;

    }
    catch (err) {
        console.log('Something went wrong: feedbackController/export', err);
        response.message = err.message;
    }
    return res.status(response.status).send(response);
}

module.exports.exporttradefeedback = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {

        const responseFromService = await feedbackService.exporttradefeedback();
        response.status = 200;
        response.message = constants.feedbackMessage.FEEDBACK_FILE_CREATED;
        response.body = responseFromService;

    }
    catch (err) {
        console.log('Something went wrong: feedbackController/export', err);
        response.message = err.message;
    }
    return res.status(response.status).send(response);
}

module.exports.tradefeedback = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        const responseFromService = await feedbackService.tradefeedback(req);
        
        if (responseFromService) {
            response.status = 200;
            response.message = constants.feedbackMessage.FEEDBACK_SUBMIT_SUCCESS;
        } else {
            response.status = 202;
            response.message = constants.feedbackMessage.FEEDBACK_AREADY_SUBMITTED;
        }
    }

    catch (err) {
        console.log('Something went wrong: feedbackController/tradefeedback', err);
        response.message = err.message;
    }
    return res.status(response.status).send(response);
}



module.exports.tradefeedbacksuiting = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        const responseFromService = await feedbackService.tradefeedbacksuiting(req);
        if (responseFromService) {
            response.status = 200;
            response.message = constants.feedbackMessage.FEEDBACK_SUBMIT_SUCCESS;
            response.body=responseFromService;
        } else {
            response.status = 202;
            response.message = constants.feedbackMessage.FEEDBACK_AREADY_SUBMITTED;
            response.body=[];
        }
    }

    catch (err) {
        console.log('Something went wrong: feedbackController/tradefeedbacksuiting', err);
        response.message = err.message;
    }
    return res.status(response.status).send(response);
}


module.exports.exporttradefeedbacksuiting = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
      const responseFromService = await feedbackService.exporttradefeedbacksuiting();
      response.status = 200;
      response.message = constants.feedbackMessage.FEEDBACK_FILE_CREATED;
      response.body = responseFromService;
    } catch (err) {
      console.log("Something went wrong: feedbackController/export", err);
      response.message = err.message;
    }
    return res.status(response.status).send(response);
  };



module.exports.gmbfeedback = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        const responseFromService = await feedbackService.gmbfeedback(req);
        if (responseFromService) {
            response.status = 200;
            response.message = constants.feedbackMessage.FEEDBACK_SUBMIT_SUCCESS;
            response.body=responseFromService;
        } else {
            response.status = 202;
            response.message = constants.feedbackMessage.FEEDBACK_AREADY_SUBMITTED;
            response.body=[];
        }
    }

    catch (err) {
        console.log('Something went wrong: feedbackController/tradefeedbacksuiting', err);
        response.message = err.message;
    }
    return res.status(response.status).send(response);
}


module.exports.apparelfeedback = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        const responseFromService = await feedbackService.apparelfeedback(req);
        if (responseFromService) {
            response.status = 200;
            response.message = constants.feedbackMessage.FEEDBACK_SUBMIT_SUCCESS;
            response.body=responseFromService;
        } else {
            response.status = 202;
            response.message = constants.feedbackMessage.FEEDBACK_AREADY_SUBMITTED;
            response.body=[];
        }
    }

    catch (err) {
        console.log('Something went wrong: feedbackController/apparelfeedback', err);
        response.message = err.message;
    }
    return res.status(response.status).send(response);
}

