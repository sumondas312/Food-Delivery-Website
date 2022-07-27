const { defaultServerResponse } = require('../constants');
const constants = require('../constants');
const reportService = require('../services/reportService');

//Order booking report pdf
module.exports.orderBookingReportpdf = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
      let data = await reportService.orderBookingReportpdf(req);
      if (data) {
        response.status = 200;
        response.message = constants.orderMessage.DOWNLOADED;
        response.body = {
          link: process.env.MEDIA_PATH2 +data,
        };
      } else {
        response.message = "Pdf is not created";
      }
    } catch (error) {
      console.log("Something went wrong", error);
      response.message = error.message;
    }
    return res.status(response.status).send(response);
  };