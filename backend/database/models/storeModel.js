const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    store_code: String,
    praveen: String,
    "mall/high_street": String,
    brand: String,
    zone: String,
    store_name: String,
    address: String,
    city: String,
    state: String,
    postal_code: String,
    store_manager_name: String,
    store_anager_mobile_no: String,
    associate_name_and_no: String,
    store_email_id: String,
    store_landline_no: String

});

module.exports = mongoose.model('store_details', storeSchema);