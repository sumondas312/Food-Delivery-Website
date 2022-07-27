const Joi = require('@hapi/joi');

module.exports.productList = Joi.object().keys({
    skip: Joi.string().allow('').regex(/^[0-9]*$/),
    limit: Joi.string().allow('').regex(/^[0-9]*$/),
    season: Joi.string().required().valid('', 'S22', 'W22', 'S23', 'W23'),
    matno_seq: Joi.string().allow('').regex(/^[0-9]*$/),
    matnr: Joi.string().allow('').regex(/^[0-9-]*$/),
    quality: Joi.string().allow('').regex(/^[0-9]*$/),
    blend: Joi.string().allow('').regex(/^[0-9]*$/),
    brand: Joi.string().allow(''),
    buyer_id: Joi.string().required()
});