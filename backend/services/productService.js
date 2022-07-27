const MainFile = require("../database/models/mainFileModel");
const UserMaster = require("../database/models/userMasterModel");
const Product = require("../database/models/productModel");
const Cart = require("../database/models/cartModel");
const { formatMongoData, checkObjectId } = require("../helpers/dbHelper");

module.exports.find_material = async ({
  skip = 0,
  limit = 30,
  id = "",
  brand = "",
  count = false,
  unique_matno_seq = false,
  shade = "",
  blend = "",
  season = "",
  matno_seq = "",
  matnr = "",
  quality = "",
}) => {
  try {
    let match = {};
    if (season) match["SEASON"] = season.toString();

    if (id) match["_id"] = id;

    if (matno_seq) match["SEQUENCE_NUMBER_OF_MATERIAL"] = matno_seq.toString();

    if (quality) match["QUALITY_NO"] = { $regex: quality.toString() };

    if (blend) match["MATERIAL_GROUP"] = blend.toString();
    // if (blend) match["MATERIAL_GROUP"] = eval('{ $regex: /' + blend.toString() + '/gi }'); // as per anuj

    if (shade) match["SHADE"] = shade.toString();

    if (matnr) match["MATERIAL"] = { $regex: matnr.toString() };

    if (brand) match["DESCRIPTION"] = eval("{ $regex: /" + brand + "/gi }");

    if (unique_matno_seq) return await Product.distinct("SEQUENCE_NUMBER_OF_MATERIAL");

    if (count) return await Product.countDocuments(match);

    const product = await Product.find(match, {
      ULC: 1,
      SEASON: 1,
      YEAR: 1,
      EX_FACTORY_PRICE: 1,
      SEQUENCE_NUMBER_OF_MATERIAL: 1,
      QUALITY: 1,
      MATERIAL: 1,
      SHADE: 1,
      id: 1,
      IMG_URL: 1,
      QUALITY_NO: 1,
      DELIVERY_PERIOD: 1,
      DESCRIPTION: 1,
      MATERIAL_GROUP: 1,
    })
      .sort({ SHADE: 1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    if (product.length) return formatMongoData(product);
    else return [];
  } catch (error) {
    console.log("Something went wrong: Service: find_material", error);
    return { status: false, message: error };
  }
};
