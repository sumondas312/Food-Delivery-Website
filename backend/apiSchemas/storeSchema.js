const joi = require('@hapi/joi')

module.exports.storesearch = joi.object().keys({
    city: joi.string(),
    pincode: joi.string()
});