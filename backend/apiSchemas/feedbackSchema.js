const Joi = require('@hapi/joi');

module.exports.feedback = Joi.object().keys({
    phone: Joi.string().required(),
    feedback1: Joi.string().required(),
    feedback2: Joi.string().required(),
    feedback3: Joi.string().required(),
    feedback4: Joi.string().required(),
    feedback5:Joi.string().required(),
});
module.exports.export = Joi.object().keys({
    phone:Joi.string().required()
})
module.exports.getallfeedbacks = Joi.object().keys({
    phone: Joi.string().required()
});
module.exports.tradefeedback = Joi.object().keys({
    phone: Joi.string().required(),
    tradefeedback1:Joi.string().required(),
    tradefeedback2:Joi.string().required(),
    tradefeedback3:Joi.string().required(),
    tradefeedback4:Joi.string().required(),
    tradefeedback5:Joi.string().required(),
    tradefeedback6:Joi.string().required(),
    tradefeedback7:Joi.string().required(),
    tradefeedback8:Joi.string().required(),
    tradefeedback9:Joi.string().required(),
    tradefeedback10:Joi.string().required(),
    tradefeedback11:Joi.string().required(),
    tradefeedback12: Joi.string().required(),
    comment: Joi.string().empty('')
});