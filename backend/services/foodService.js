const constants = require('../constants');
const { formatMongoData } = require('../helpers/dbHelper');
const FoodOrder = require('../database/models/foodModel');
var pdf = require('pdf-creator-node');
var fs = require('fs');
const moment = require('moment');
const FoodUser = require('../database/models/fooduserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.foodsignup = async ({ name, email, password }) => {
  try {
    const user = await FoodUser.findOne({ email });
    if (user) {
      throw new Error(constants.userMessage.DUPLICATE_EMAIL);
    }
    password = await bcrypt.hash(password, 12);
    const newfoodUser = new FoodUser({ name, email, password });
    let result = await newfoodUser.save();
    console.log(result);
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: signup', error);
    throw new Error(error);
  }
};

module.exports.foodlogin = async ({ email, password }) => {
  try {
    const user = await FoodUser.findOne({ email });

    if (!user) {
      throw new Error(constants.userMessage.USER_NOT_FOUND);
    }
    console.log(user);
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error(constants.userMessage.INVALID_PASSWORD);
    }
    const name = user.name;
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY || 'my-secret-key', { expiresIn: '1d' });

    let oldTokens = user.tokens || [];

    if (oldTokens.length) {
      oldTokens = oldTokens.filter((t) => {
        const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
        if (timeDiff < 86400) {
          return t;
        }
      });
    }
    await FoodUser.findByIdAndUpdate(user._id, { tokens: [...oldTokens, { token, signedAt: Date.now().toString() }] });

    return { name, token };
  } catch (error) {
    console.log('Something went wrong: Service: login', error);
    throw new Error(error);
  }
};

// Order booking
module.exports.orderBookingpdf = async (req) => {
  var html = fs.readFileSync('helpers/food/order_booking.html', 'utf8');
  var path = 'pdf/order_booking_' + Math.floor(Math.random() * 10000) + '.pdf';
  // let cur_date = new Date();
  // let order_date = moment(cur_date).format('DD-MM-YYYY');
  // let order_time = moment(cur_date).format('hh:mm:ss');

  var orderData = {
    name: req.body.name,
    mobile: req.body.mobile,
    order: req.body.order,
    quantity: req.body.quantity,
    date: req.body.date,
    time: req.body.time,
    address: req.body.address,
  };

  try {
    const food = new FoodOrder(orderData);
    let orderResult = await food.save();

    var options = {
      format: 'A4',
      orientation: 'portrait',
      border: '60mm',
    };
    var document = {
      html: html,
      data: orderData,
      path: 'downloads/' + path,
      type: '',
    };

    pdf.create(document, options).then((res) => {
      console.log(res);
    });
    return path;
  } catch (error) {
    console.log('Something went wrong', error);
    return { status: false, message: error };
  }
};
