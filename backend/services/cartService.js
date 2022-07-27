const MainFile = require("../database/models/mainFileModel");
const UserMaster = require("../database/models/userMasterModel");
const Product = require("../database/models/productModel");
const { formatMongoData, checkObjectId } = require("../helpers/dbHelper");
const Cart = require("../database/models/cartModel");


module.exports.find_material = async ({ skip = 0, limit = 0, count = false, season = "", matno_seq = "", matnr = "", quality = "" }) => {
  try {
    let match = {};
    if (season) match["SEASON"] = season;

    if (matno_seq) match["MATNO_SEQ"] = matno_seq;

    if (quality) match["QUALITY"] = quality;

    if (matnr) match["MATNR"] = { $regex: matnr };

    if (count) return await Product.countDocuments(match);

    const product = await Product.find(match).sort({ _id: -1 }).skip(parseInt(skip)).limit(parseInt(limit));

    if (product.length) return formatMongoData(product);
    else return []
  } catch (error) {
    console.log("Something went wrong: Service: find_material", error);
    return { status: false, message: error };
  }
};

module.exports.find_cart_items = async ({
  skip = 0,
  limit = 0,
  units = "",
  ulc = "",
  id = "",
  shade = "",
  serial_no = "",
  material_no = "",
  delivery_period = "",
  season = "",
  count = false,
  user_id = "",
  product_id = "",
}) => {
  try {
    let match = {};
    if (user_id) match["user_id"] = user_id;
    if (material_no) match["material_no"] = material_no;
    if (delivery_period) match["delivery_period"] = delivery_period;
    if (ulc) match["ulc"] = ulc;
    if (units) match["units"] = units;
    if (serial_no) match["serial_no"] = serial_no;
    if (shade) match["shade"] = shade;
    if (season) match["season"] = season;
    if (product_id) match["product_id"] = product_id;
    if (id) match["_id"] = id;

    if (count) return await Cart.countDocuments(match);

    const product = await Cart.find(match).sort({ _id: -1 }).skip(parseInt(skip)).limit(parseInt(limit));

    if (product.length) return formatMongoData(product);
    else return [];
  } catch (error) {
    console.log("Something went wrong: Service: find_cart_items", error);
    return { status: false, message: error };
  }
};

module.exports.update_cart_items = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    
    const product = await Cart.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true, useFindAndModify: false }
    )

    if (product) return formatMongoData(product);
    else return false;
  } catch (error) {
    console.log("Something went wrong: Service: update_cart_items", error);
    return { status: false, message: error };
  }
};

module.exports.delete_cart_items = async ({ id }) => {
  try {
    checkObjectId(id)
    const product = await Cart.findByIdAndRemove({ _id: id })

    if (product) return formatMongoData(product);
    else return false;
  } catch (error) {
    console.log("Something went wrong: Service: delete_cart_items", error);
    return { status: false, message: error };
  }
};

module.exports.bulkDeleteByUserId = async ({ user_id }) => {
  try {
    console.log(user_id, "user_id");
    checkObjectId(user_id)
    const product = await Cart.deleteMany({ user_id: user_id });

    return true
    // if (product.deletedCount > 0) return true;
    // else return false;
  } catch (error) {
    console.log("Something went wrong: Service: bulkDeleteByUserId", error);
    return { status: false, message: error };
  }
};


module.exports.insertCartDetails = async (serviceData) => {
  try {
    let info = new Cart({ ...serviceData });
    let result = await info.save();

    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: insertCartDetails', error);
    throw new Error(error);
  }
};