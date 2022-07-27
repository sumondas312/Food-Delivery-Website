const constants = require('../constants');
const storeService = require('../services/storeService');


module.exports.storesearch = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        console.log(req.body.pincode);
        // const pin = req.body.pincode;
        const pincodeSize = req.body.pincode.length;
        console.log('Size of pin is ' + pincodeSize);
        if (pincodeSize >= 1 && pincodeSize <= 5) {
            throw new Error(constants.storeMessage.WRONG_PINCODE);
        }

        const responseFromService = await storeService.storesearch(req.body);
        response.status = 200;
        response.message = constants.storeMessage.GET_ALL_STORE_SUCCESS;
        response.body = responseFromService;
    }

    catch (err) {
        console.log('Something went wrong: storecontroller/storesearch', err);
        response.message = err.message;
    }
    return res.status(response.status).send(response);
}