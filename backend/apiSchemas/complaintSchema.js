const Joi = require('@hapi/joi');

module.exports.insert = Joi.object().keys({
    description: Joi.string().required(),
    selected_complaint: Joi.string().required(),
    priority: Joi.string().required(),
    // file: Joi.file().allow(null, ''),
});