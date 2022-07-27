const Joi = require('@hapi/joi');

exports.insertToCart = Joi.object().keys({
  buyer_id: Joi.string().required(),
  booking_sub_category: Joi.string().required(),
  agent_id: Joi.string().allow(''),
  items: Joi.array().items({
    product_id: Joi.string().required(),
    material_no: Joi.string().required(),
    season: Joi.string().required(),
    category: Joi.string().required(),
    shade: Joi.string().required(),
    delivery_period: Joi.string().required().regex(/^[0-9]*$/),
    ulc: Joi.string().required().regex(/^[0-9]*$/),
    units: Joi.string().required().regex(/^[0-9]*$/),
    // units: Joi.string().required().regex(/^[0-9]*$/),
  })
});

exports.updateToCart = Joi.object().keys({
  delivery_period: Joi.string().required().regex(/^[0-9]*$/),
  ulc: Joi.string().required().regex(/^[0-9]*$/),
  units: Joi.string().required().regex(/^[0-9]*$/),
});

exports.fetchAllCartItems = Joi.object().keys({
  skip: Joi.string().allow('').regex(/^[0-9]*$/),
  limit: Joi.string().allow('').regex(/^[0-9]*$/),  
});