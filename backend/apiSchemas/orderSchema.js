const Joi = require('@hapi/joi');

// module.exports.importcsvorder=Joi.object.keys({

// })

module.exports.insertToOrder = Joi.object().keys({
    order_id: Joi.string().allow(''),
    temp_order_id: Joi.string().required(),
    order_status: Joi.string().required().valid('', 'hold', 'active', 'cancel')
});
module.exports.transferOrder = Joi.object().keys({
    order_id: Joi.string().required(),
    status: Joi.string().required().valid("re_order", "cancel"),
});

exports.insertToTemporaryOrder = Joi.object().keys({
    agent_id: Joi.string().allow(''),
    buyer_id: Joi.string().required(),
    // collection_period: Joi.string().required(),
    season: Joi.string().required(),
    category: Joi.string().required(),
    booking_sub_category: Joi.string().required(),
    items: Joi.array().items({
        product_id: Joi.string().required(),
        // ex_mill_price: Joi.string().required(),
        material_no: Joi.string().required(),
        delivery_period: Joi.string().required().regex(/^[0-9]*$/),
        ulc: Joi.string().required().regex(/^[0-9]*$/),
        units: Joi.string().required().regex(/^[0-9]*$/),
        shade: Joi.string().required(),
        // serial_no: Joi.string().required()
    })
});

module.exports.orderList = Joi.object().keys({
    orderId: Joi.string().allow(''),
    season: Joi.string().valid('W21', 'W22', 'W23', 'S21', 'S22', 'S23'),
    category: Joi.string().valid('seasonal_booking', ''),
    // category: Joi.string().valid('W21', 'W22', 'W23', 'S21', 'S22', 'S23'),
    // season: Joi.string().valid('seasonal_booking',''),
    zonal: Joi.string().allow(''),
    rsm: Joi.string().allow(''),
    asm: Joi.string().allow(''),
    agent: Joi.string().allow(''),
    buyer: Joi.string().allow(''),
    national: Joi.string().allow(''),
    orderId: Joi.string().allow(''),
    skip: Joi.string().allow('').regex(/^[0-9]*$/),
    limit: Joi.string().allow('').regex(/^[0-9]*$/),
});
module.exports.downloadOrder = Joi.object().keys({
    orderId: Joi.string().required(),
});
module.exports.exportOrder = Joi.object().keys({
    category: Joi.string().allow(''),
});

module.exports.singleOrderList = Joi.object().keys({
    skip: Joi.string().allow('').regex(/^[0-9]*$/),
    limit: Joi.string().allow('').regex(/^[0-9]*$/),
});