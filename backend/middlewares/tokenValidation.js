const constants = require('../constants');
const jwt = require('jsonwebtoken');
const userService = require("../services/userLoginService");

module.exports.validateToken = async (req, res, next) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.headers.authorization) throw new Error(constants.requestValidationMessage.TOKEN_MISSING);
    
    const token = req.headers.authorization.split('Bearer')[1].trim();
    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'my-secret-key');
    if (decoded) {
      let userData = await userService.searchLoginUser({ id: decoded.id });
      if (!userData) throw new Error(`You are not authorised!!!`);
      req.body.user_id = decoded.id;
      req.body.user_role = userData.user_type;
      req.body.email = userData.email;
      return next();
    } else return false;
  } catch (error) {
    console.log('Error', error);
    response.message = error.message;
    response.status = 401;
  }
  return res.status(response.status).send(response);
}