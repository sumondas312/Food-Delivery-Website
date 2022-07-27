const Joi = require('@hapi/joi');

module.exports.login = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});


module.exports.updateRequest = Joi.object().keys({
  password: Joi.string().required(),
  confirm_password: Joi.string().required(),
  old_password: Joi.string().required(),
});

module.exports.profileUpdateRequest = Joi.object().keys({
  description: Joi.string().required(),
});