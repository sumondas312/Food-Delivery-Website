const Joi = require('@hapi/joi');



exports.booking = Joi.object().keys({
    booking_type: Joi.string().valid('seasonal_booking'),
    booking_sub_category: Joi.string().required().valid('shirting', 'suiting', 'apparel'),
});

exports.buyer_data = Joi.object().keys({
    name: Joi.string().allow(''),
    customer_no: Joi.string().allow(''),
    agent_id: Joi.string().allow(''),
    search_type: Joi.string().valid('specific_search', ''),
});

exports.family_tree = Joi.object().keys({
    skip: Joi.string().allow('').regex(/^[0-9]*$/),
    limit: Joi.string().allow('').regex(/^[0-9]*$/),
    zonal: Joi.string().allow(''),
    rsm: Joi.string().allow(''),
    asm: Joi.string().allow(''),
    agent: Joi.string().allow(''),
    agent_id: Joi.string().allow(''),
});

exports.familyTreeHierarchy = Joi.object().keys({
    skip: Joi.string().allow('').regex(/^[0-9]*$/),
    limit: Joi.string().allow('').regex(/^[0-9]*$/),
    user_type: Joi.string().valid('national_head', 'zonal_manager', 'rsm', 'asm', 'agent')
});