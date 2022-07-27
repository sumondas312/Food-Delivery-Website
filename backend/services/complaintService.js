const MainFile = require("../database/models/mainFileModel");
const UserMaster = require("../database/models/userMasterModel");
const ComplaintMaster = require("../database/models/complaintMasterModel");
const Complaint = require("../database/models/complaintModel");
const Product = require("../database/models/productModel");
const Cart = require("../database/models/cartModel");
const { formatMongoData, checkObjectId } = require("../helpers/dbHelper");

module.exports.insert_complaint = async (serviceData) => {
  try {
    let data = new Complaint({ ...serviceData });
    await data.save();
    return true;
  } catch (error) {
    console.log("Something went wrong: Service: insert_complaint", error);
    throw new Error(error);
  }
};

module.exports.uniqueCodeGeneratorForComplain = async () => {
  try {
    function randomString(length, chars) {
      var result = "";
      for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      return result;
    }
    let existCheck = async ({ ticket_no }) => {
      let exist = await Complaint.findOne({
        ticket_no: ticket_no,
      });
      if (exist) return await existCheck({ ticket_no: randomString(14, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ") });
      else return ticket_no;
    };
    let key = randomString(14, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    return (ticket_no = await existCheck({ ticket_no: key }));
  } catch (error) {
    console.log("Something went wrong: Service: uniqueCodeGeneratorForComplain", error);
    throw new Error(error);
  }
};
