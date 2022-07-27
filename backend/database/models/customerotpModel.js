const mongoose = require('mongoose');

const customerotpSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required:true},
    otp: {
        type: String,
        required:true},
    is_active: {
        type: String,
        required:true},
    is_verified: {
        type: String,
        required:true}
}, {
    timestamps:true
});

module.exports = mongoose.model('customerotp', customerotpSchema);