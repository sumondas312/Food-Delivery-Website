const constants = require('../constants');
const userService = require('../services/userLoginService');
const cartService = require('../services/cartService');
const importService = require('../services/importService');

const jwt = require('jsonwebtoken');
const fs = require('fs');
const axios = require('axios');
const bcrypt = require('bcrypt');
const csv = require('csvtojson');

module.exports.userLogin = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    const { email, password } = req.body;
    const responseFromService = await userService.user_login_service({ email, password });

    if (responseFromService.status) {
      let count = await cartService.find_cart_items({ user_id: responseFromService.data.id, count: true });
      const token = jwt.sign({
        id: responseFromService.data.id,
        user_type: responseFromService.data.user_type,
        email: responseFromService.data.email,
      },
        process.env.SECRET_KEY || "buyraymond-secret-key", {
        expiresIn: "1y"
      });

      response.status = 200;
      response.message = constants.userMessage.LOGIN_SUCCESS;
      response.body = {
        name: responseFromService.data.name,
        role: responseFromService.data.user_type,
        loginId: responseFromService.data.customer_id,
        cartCount: count ? count : 0,
        token: token,
        id: responseFromService.data.id,
      };
      return res.status(response.status).send(response);
    } else {
      response.status = 400;
      response.message = responseFromService.message;
      return res.status(response.status).send(response);
    }
  } catch (error) {
    console.log('Something went wrong: Controller: userLogin', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

module.exports.profileView = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let access_request = false;
    if (!req.body) throw new Error(`You are not authorised!!!`);
    const { user_id, user_role } = req.body;
    let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
    if (authorised_access.includes(user_role)) access_request = true;
    else throw new Error(`You are not authorised!!!`);

    if (!access_request) throw new Error(`You are not authorised!!!`);
    let userData = await userService.searchLoginUser({ id: user_id });

    let profile = {
      name: userData.name,
      category: user_role.toUpperCase().replace(/_/g, " "),
      email: userData.email,
      mobile: userData.mobile,
      address: userData.address,
    }
    response.status = 200;
    response.message = constants.userMessage.PROFILE_VIEW_SUCCESS;
    response.body = {
      profile: profile
    };

  } catch (error) {
    console.log('Something went wrong: Controller: profileView', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
}

module.exports.updateProfilePassword = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let access_request = false;
    if (!req.body) throw new Error(`You are not authorised!!!`);
    const { user_id, user_role } = req.body;
    let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
    if (authorised_access.includes(user_role)) access_request = true;
    else throw new Error(`You are not authorised!!!`);
    if (!access_request) throw new Error(`You are not authorised!!!`);

    const { password, confirm_password, old_password } = req.body;
    let userData = await userService.searchLoginUser({ id: user_id });

    const isValid = await bcrypt.compare(old_password, userData.password);
    if (password === confirm_password && isValid) {
      let pass = await bcrypt.hash(password, 12);
      let data = { password: pass }
      await userService.updateUser({ id: user_id, updateInfo: data });

      response.status = 200;
      response.message = constants.userMessage.PASSWORD_CHANGE_SUCCESS;
    } else {
      response.message = constants.userMessage.PASSWORD_CHANGE_FAILED;
    }
  } catch (error) {
    console.log('Something went wrong: Controller: updateProfilePassword', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
}

module.exports.userMapping = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    await userService.userMapping();

    response.status = 200;
    response.message = `Step-1 mapping in process...`;
  } catch (error) {
    console.log('Something went wrong: Controller: userMapping', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

module.exports.buyerCreation = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    await userService.buyerDataMappingInUserMaster();

    response.status = 200;
    response.message = `Step-2 buyer creation in process...`;
  } catch (error) {
    console.log('Something went wrong: Controller: buyerCreation', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

module.exports.userMasterDataSyncFinal = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    await userService.userMasterDataSync();

    response.status = 200;
    response.message = `Step-3 data sync in process...`;
  } catch (error) {
    console.log('Something went wrong: Controller: userMasterDataSyncFinal', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

module.exports.userMasterMultipleAccessIdentifier = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    // await userService.userMasterMultipleAccessProvider();

    response.status = 200;
    response.message = `Step-4 data sync in process...`;
  } catch (error) {
    console.log('Something went wrong: Controller: userMasterMultipleAccessIdentifier', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};


module.exports.addBuyerProfile = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    const token = req.headers.authorization.split('Bearer')[1].trim();
    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'buyraymond-secret-key');
    let userData = await userService.searchLoginUser({ id: decoded.id });
    if (!userData) throw new Error(`You are not authorised to create!!!`);
    user_id = decoded.id;
    user_role = decoded.user_type;

    const { name, email, mobile, address, pincode, district, city, state, agent } = req.body;

    let new_insert = {
      name: name,
      email: email,
      mobile: mobile,
      city: city,
      state: state,
      district: district,
      pincode: pincode,
      address: address,
      password: '$2b$12$t1ERHiS05YmXWWs/LFr3HuswPSCLU3iIGKhtsvft7imp6lBpd4t6y',
      is_deleted: 'n',
      status: "Active",
      format_type: '6073fccb1996fceb11d1a960',//default value until any instruction come
      customer_id: await userService.uniqueCodeGeneratorForCustomerId(),

      rsm_id: userData.rsm_id,
      national_id: userData.national_id,
      zonal_id: userData.zonal_id,
      asm_id: user_id,
      agent_id: agent,
      user_type: 'buyer'
    }


    await importService.insertUserMasterFile(new_insert);

    response.status = 200;
    response.message = constants.userMessage.UPDATE;

  } catch (error) {
    console.log('Something went wrong: Controller: addBuyerProfile', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

module.exports.ProfileUpdaterequest = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let access_request = false;
    if (!req.body) throw new Error(`You are not authorised!!!`);
    const { user_id, user_role } = req.body;
    let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
    if (authorised_access.includes(user_role)) access_request = true;
    else throw new Error(`You are not authorised!!!`);

    if (!access_request) throw new Error(`You are not authorised!!!`);

    let new_insert = {
      description: req.body.description
    }

    new_insert['request_no'] = await userService.uniqueCodeGeneratorForRequest();
    new_insert['submitted_by'] = user_id;
    new_insert['user_type'] = user_role;

    let data = await userService.insertUserUpdateRequest(new_insert);

    response.status = 201;
    response.message = `Thanks for your update`;
    response.body = {
      code: data.request_no
    }
  } catch (error) {
    console.log('Something went wrong: Controller: ProfileUpdaterequest', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

module.exports.userMasterEmailLowerCaseConversion = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    await userService.conversion_email_lowercase();

    response.status = 200;
    response.message = `Email correction in process...`;
  } catch (error) {
    console.log('Something went wrong: Controller: userMasterEmailLowerCaseConversion', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};