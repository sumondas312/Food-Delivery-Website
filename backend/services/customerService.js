const constants = require('../constants');
const { formatMongoData } = require('../helpers/dbHelper');
const Customer = require('../database/models/customerModel');
const CustomerOtp = require('../database/models/customerotpModel');

let fastcsv = require('fast-csv');
let fs = require('fs');
const math = require('math');

var dateofmonth = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};
let limit = 10;

module.exports.otplogin = async ({ mobile }) => {
  let findcustomer;
  try {
    let info = {
      mobile: mobile,
    };
    findcustomer = await Customer.findOne(info);
    if (!findcustomer) return { status: 202, message: 'Customer not Found!' };

    let findExistingOtp = await CustomerOtp.findOne({ mobile });

    if (findExistingOtp) {
      await CustomerOtp.deleteMany({ mobile: mobile });
    }

    let generateOtp = Math.floor(Math.random() * 1000000 + 1).toString();
    console.log(generateOtp);

    var otp = {
      mobile: mobile,
      otp: generateOtp,
      is_active: '1',
      is_verified: '0',
    };
    let newOtp = await new CustomerOtp(otp);
    let resultOtp = await newOtp.save();

    return { status: 200, message: 'success', data: newOtp };
  } catch (err) {
    console.log('Something went wrong: Services/customerService/otplogin', err);
    throw new Error(err);
  }
};

module.exports.getdetails = async ({ mobile, otp }) => {
  let details = {};
  const suppliedmobile = mobile;
  const suppliedotp = otp;
  const existingotp = await CustomerOtp.findOne({ mobile: suppliedmobile });

  const now = Date.now();
  console.log(now);
  console.log(existingotp.createdAt);

  try {
    if (existingotp.otp == suppliedotp && existingotp.is_verified == 0) {
      // await CustomerOtp.updateMany({ mobile: suppliedmobile }, { is_verified: '1' });
      await CustomerOtp.updateMany({ mobile: suppliedmobile });
      details.status = 200;
      details.body = await Customer.find({ mobile: mobile });
      return details;
    } else {
      details.status = 202;
      details.body = [];
      return details;
    }
  } catch (err) {
    console.log('Something went wrong: Service: getdetails', err);
    throw new Error('Invalid OTP');
  }
};

module.exports.customerfilter = async ({ dom, skip }) => {
  let requestmonth = dateofmonth[dom];
  let customerresult = await Customer.find({});
  let filtercustomer = [];
  let size = customerresult.length;
  for (i = 0; i < size; i++) {
    let customerdate = customerresult[i].dob.split('-')[1];
    if (requestmonth == customerdate) {
      filtercustomer.push(customerresult[i]);
    }
  }
  let customerfilteredresult = await filtercustomer.slice(skip * limit, skip * limit + limit);
  console.log(filtercustomer);
  return customerfilteredresult;
};

module.exports.customerfilterfirst = async ({ dom }) => {
  let skip = 0;
  let requestmonth = dateofmonth[dom];
  let customerresult = await Customer.find({});
  let filtercustomer = [];

  let size = customerresult.length;
  for (i = 0; i < size; i++) {
    let customerdate = customerresult[i].dob.split('-')[1];
    if (requestmonth == customerdate) {
      filtercustomer.push(customerresult[i]);
    }
  }
  let totalresponse = filtercustomer.length;
  let customerfilteredresult = await filtercustomer.slice(skip * limit, skip * limit + limit);

  console.log(filtercustomer);
  console.log(totalresponse);
  var firstcontent = {
    size: totalresponse,
    customers: customerfilteredresult,
  };
  return firstcontent;
};

module.exports.exportfilterecustomer = async ({ dom }) => {
  let requestmonth = dateofmonth[dom];
  let customerresult = await Customer.find({});
  let filtercustomer = [];
  let len = customerresult.length;
  for (i = 0; i < len; i++) {
    let customerdate = customerresult[i].dob.split('-')[1];
    if (requestmonth == customerdate) {
      filtercustomer.push(customerresult[i]);
    }
  }
  let totalresponse = filtercustomer.length;
  let randomnumber = Math.floor(Math.random() * 1000000 + 1);
  let ws = fs.createWriteStream('Exported_Filtered_Customer_Data.csv');
  try {
    let jsonData = [];
    for (let i = 0; i < totalresponse; i++) {
      let fname = filtercustomer[i].fname;
      let lname = filtercustomer[i].lname;
      let email_id = filtercustomer[i].emailid;
      let mobile = filtercustomer[i].mobile;
      let dob = filtercustomer[i].dob;
      var exportobject = {
        firstname: fname,
        lastname: lname,
        email: email_id,
        mobile: mobile,
        dob: dob,
      };
      jsonData.push(exportobject);
    }
    fastcsv
      .write(jsonData, { headers: true })
      .on('finish', function () {
        console.log('Customer Data File Generated..');
      })
      .pipe(ws);
    var oldPath = 'Exported_Filtered_Customer_Data.csv';
    var newPath = `downloads/Exported_Filtered_Customer_Data_${randomnumber}.csv`;
    fs.rename(oldPath, newPath, function (err) {
      if (err) throw new Error(err);
    });
    const directoryName = process.env.api_base_url;
    const directFileUrl = directoryName + '/' + newPath;
    const fileUrl = { fileurl: directFileUrl };
    return fileUrl;
  } catch (error) {
    console.log('Something went wrong: Service: export', error);
    throw new Error(error);
  }
};
