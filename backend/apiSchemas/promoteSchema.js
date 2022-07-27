const Joi = require('@hapi/joi');

module.exports.questionnaire = Joi.object().keys({
    name: Joi.string().required(),
    mobile: Joi.required(),
    features: Joi.required(),
    rating: Joi.required(),
    comment: Joi.string().allow(''),
});