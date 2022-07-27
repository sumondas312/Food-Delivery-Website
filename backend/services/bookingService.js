const MainFile = require("../database/models/mainFileModel");
const UserMaster = require("../database/models/userMasterModel");
const Product = require("../database/models/productModel");
const { formatMongoData, checkObjectId } = require("../helpers/dbHelper");
const Cart = require("../database/models/cartModel");
const SeasonMaster = require("../database/models/seasonMasterModel");


module.exports.find_season = async ({ skip = 0, limit = 0, count = false }) => {
  try {
    let match = {};

    if (count) return await SeasonMaster.countDocuments(match);

    const season = await SeasonMaster.find(match).sort({ _id: -1 }).skip(parseInt(skip)).limit(parseInt(limit));

    if(season.length) return formatMongoData(season);
    else return []
  } catch (error) {
    console.log("Something went wrong: Service: find_season", error);
    return { status: false, message: error };
  }
};
