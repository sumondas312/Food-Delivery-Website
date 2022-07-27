const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    emailid: String,
    mobile: String,
    dob:String
});

module.exports = mongoose.model('customer', customerSchema);