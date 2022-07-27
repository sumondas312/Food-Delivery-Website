const Store = require('../database/models/storeModel')
const constants = require('../constants');
const { formatMongoData } = require('../helpers/dbHelper');


module.exports.storesearch = async (req) => {
    const city = await req.city;
    const pincode = await req.pincode;
    console.log("City from storeservice request " + city);
    console.log("Pincode from storeservice request " + pincode);
    // console.log(req);
    if (city != '' && pincode != '') {
        console.log("Both city and pincode given");
        try {
            const storedata = await Store.find({ city: city, postal_code: pincode });
            const size = Object.keys(storedata).length;
            console.log("Length of storedata is " + size);
            if (size >= 1) {
                // console.log(storedata);
                return formatMongoData(storedata);
            }
            else {
                throw new Error(constants.storeMessage.STORE_NOT_FOUND);
            }
        }
        catch (err) {
            console.log('Something went wrong: Service/storesearch', err);
            throw new Error(err);
        }
    }

    else if (city != '' && pincode == '') {
        console.log("Search using city...");
        try {
            const storedata = await Store.find({ city: city });
            const size = Object.keys(storedata).length;
            console.log("Length of storedata is " + size);
            if (size >= 1) {
                // console.log(storedata);
                return formatMongoData(storedata);
            }
            else {
                throw new Error(constants.storeMessage.STORE_NOT_FOUND);
            }
        }
        catch (err) {
            console.log('Something went wrong: Service/storesearch', err);
            throw new Error(err);
        }
    }


    else if (city == '' && pincode != '') {
        console.log('Search using Pincode...');
        try {
            const storedata = await Store.find({ postal_code: pincode });
            const size = Object.keys(storedata).length;
            // console.log("Length of storedata is " + size);
            if (size >= 1) {
                console.log(storedata);
                return formatMongoData(storedata);
            }
            else {
                throw new Error(constants.storeMessage.STORE_NOT_FOUND);
            }
        }
        catch (err) {
            console.log('Something went wrong: Service/storesearch', err);
            throw new Error(err);
        }
    }

    else {
        throw new Error(constants.requestValidationMessage.BAD_REQUEST);
    }

}