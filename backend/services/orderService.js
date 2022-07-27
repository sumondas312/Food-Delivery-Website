const MainFile = require("../database/models/mainFileModel");
const UserMaster = require("../database/models/userMasterModel");
const Product = require("../database/models/productModel");
const { formatMongoData, checkObjectId } = require("../helpers/dbHelper");
const Cart = require("../database/models/cartModel");
const LineItem = require("../database/models/lineItemModel");
const TempLineItem = require("../database/models/tempLineItem.model");
const Order = require("../database/models/orderModel");
const TempOrder = require("../database/models/tempOrder.model");
const UlcConversion = require("../database/models/ulcMasterModel");
const OrderMap = require("../database/models/confirmOrderMap.model");
const moment = require("moment");

let pdf = require("html-pdf");
let ejs = require("ejs");
let path = require("path");
const { fail } = require("assert");



module.exports.importcsvorder = async ({ ...serviceData }) => {
  // let resultstatus = [];

  //const success = "Document inserted successfully";
  //const failed = "Failed! insertion unsuccessful..";


  try {
    let arrResult = serviceData.jsonData;
    console.log("result", arrResult);
    let arrInertResult = []
    for (var v of arrResult) {
      let info = new Order(v);
      var result = await info.save();
      arrInertResult.push(result)
      console.log(result);

    }
    return await formatMongoData(arrInertResult);

  } catch (error) {
    console.log("Something went wrong: Service: confirmOrderMap", error);
    throw new Error(error);
  }

}

module.exports.confirmOrderMap = async (serviceData) => {
  try {
    let info = new OrderMap({ ...serviceData });
    let result = await info.save();

    return formatMongoData(result);
  } catch (error) {
    console.log("Something went wrong: Service: confirmOrderMap", error);
    throw new Error(error);
  }
};

module.exports.findConfirmOrderMapData = async ({
  skip = 0,
  limit = 0,
  user_id = "",
  order_mid = "",
  user_role = "",
  buyer_id = "",
  season = "",
  material_no = "",
  category = "",
  id = "",
  count = false,
}) => {
  try {
    let match = {};
    if (id) match["_id"] = id;
    if (user_id) match["user_id"] = user_id;
    if (order_mid) match["order_mid"] = order_mid;
    if (user_role) match["user_role"] = user_role;
    if (buyer_id) match["buyer_id"] = buyer_id;
    if (season) match["season"] = season;
    if (material_no) match["material_no"] = material_no;
    if (category) match["category"] = category;

    if (count) return await OrderMap.countDocuments(match);

    const prev_order = await OrderMap.find(match).sort({ _id: -1 }).skip(parseInt(skip)).limit(parseInt(limit));

    if (prev_order.length) return formatMongoData(prev_order);
    else return [];
  } catch (error) {
    console.log("Something went wrong: Service: findConfirmOrderMapData", error);
    return { status: false, message: error };
  }
};

module.exports.insertLineItem = async (serviceData) => {
  try {
    let info = new LineItem({ ...serviceData });
    let result = await info.save();

    return formatMongoData(result);
  } catch (error) {
    console.log("Something went wrong: Service: insertLineItem", error);
    throw new Error(error);
  }
};

module.exports.deleteLineItem = async ({ order_id }) => {
  try {
    console.log("delete---", order_id);
    await LineItem.deleteMany({ order_id: order_id });

    return true;
  } catch (error) {
    console.log("Something went wrong: Service: deleteLineItem", error);
    throw new Error(error);
  }
};

module.exports.insertTemporaryLineItem = async (serviceData) => {
  try {
    let info = new TempLineItem({ ...serviceData });
    let result = await info.save();

    return formatMongoData(result);
  } catch (error) {
    console.log("Something went wrong: Service: insertTemporaryLineItem", error);
    throw new Error(error);
  }
};

module.exports.insertOrder = async (serviceData) => {
  try {
    let info = new Order({ ...serviceData });
    let result = await info.save();

    return formatMongoData(result);
  } catch (error) {
    console.log("Something went wrong: Service: insertOrder", error);
    throw new Error(error);
  }
};

module.exports.updateOrder = async ({ id, updateInfo }) => {
  try {
    const result = await Order.findOneAndUpdate({ _id: id }, updateInfo, { new: true, useFindAndModify: false });
    return formatMongoData(result);
  } catch (error) {
    console.log("Something went wrong: Service: updateOrder", error);
    throw new Error(error);
  }
};

module.exports.insertTemporaryOrder = async (serviceData) => {
  try {
    let info = new TempOrder({ ...serviceData });
    let result = await info.save();

    return formatMongoData(result);
  } catch (error) {
    console.log("Something went wrong: Service: insertTemporaryOrder", error);
    throw new Error(error);
  }
};

module.exports.uniqueCodeGeneratorForOrder = async ({ category }) => {
  try {
    let find_date = moment(new Date()).format("YYYY-MM-DD");
    let count = await Order.countDocuments({ createdAt: { $gte: find_date, $lte: find_date + " 23:59:59" } });
    let booking_count = "";
    let book_code = "";
    let book_type = "";
    let day = "";
    let month = "";
    let year = "";
    let current_date = new Date();
    let uniqueKeyGenerator = async ({ category, count }) => {
      day = current_date.getDate().toString();
      year = current_date.getFullYear().toString();
      year = year.slice(-2);
      month = (current_date.getMonth() + 1).toString();
      if (month.length < 2) month = `0${month}`;
      booking_count = (count + 1).toString();
      if (category && category.toLowerCase() === "seasonal_booking") {
        book_code = "01";
        book_type = "SU";
      }

      booking_count = booking_count.padStart(4, "0");
      let OrderId = `${book_type}${book_code}${year}${month}${day}${booking_count}`;

      let existCheck = async ({ OrderId }) => {
        let exist = await Order.findOne({ order_id: OrderId });
        if (exist) {
          booking_count = (parseInt(booking_count) + 1).toString();
          booking_count = booking_count.padStart(4, "0");
          let key = `${book_type}${book_code}${year}${month}${day}${booking_count}`;
          return await existCheck({ OrderId: key });
        } else return OrderId;
      };
      return (OrderId = await existCheck({ OrderId }));
    };
    return (OrderId = await uniqueKeyGenerator({ category, count }));
  } catch (error) {
    console.log("Something went wrong: Service: uniqueCodeGeneratorForOrder", error);
    throw new Error(error);
  }
};

module.exports.uniqueCodeGeneratorForTemporaryOrder = async ({ category }) => {
  try {
    let find_date = moment(new Date()).format("YYYY-MM-DD");
    let count = await Order.countDocuments({ createdAt: { $gte: find_date, $lte: find_date + " 23:59:59" } });
    let booking_count = "";
    let book_code = "";
    let book_type = "";
    let day = "";
    let month = "";
    let year = "";
    let current_date = new Date();
    let uniqueKeyGenerator = async ({ category, count }) => {
      day = current_date.getDate().toString();
      year = current_date.getFullYear().toString();
      year = year.slice(-2);
      month = (current_date.getMonth() + 1).toString();
      if (month.length < 2) month = `0${month}`;
      booking_count = (count + 1).toString();
      if (category && category.toLowerCase() === "seasonal_booking") {
        book_code = "01";
        book_type = "SU";
      }

      booking_count = booking_count.padStart(4, "0");
      let OrderId = `${book_type}${book_code}${year}${month}${day}${booking_count}`;

      let existCheck = async ({ OrderId }) => {
        let exist = await TempOrder.findOne({ order_id: OrderId });
        if (exist) {
          booking_count = (parseInt(booking_count) + 1).toString();
          booking_count = booking_count.padStart(4, "0");
          let key = `${book_type}${book_code}${year}${month}${day}${booking_count}`;
          return await existCheck({ OrderId: key });
        } else return OrderId;
      };
      return (OrderId = await existCheck({ OrderId }));
    };
    return (OrderId = await uniqueKeyGenerator({ category, count }));
  } catch (error) {
    console.log("Something went wrong: Service: uniqueCodeGeneratorForTemporaryOrder", error);
    throw new Error(error);
  }
};

module.exports.findOrders = async ({
  skip = 0,
  limit = 0,
  order_id = "",
  status = "",
  agent_id = "",
  id = "",
  buyer_id = "",
  payment_status = "",
  payment_method = "",
  type = "",
  count = false,
  user_id = "",
  zonal_id = "",
  rsm_id = "",
  asm_id = "",
  national_id = "",
  category = "",
  season = "",
}) => {
  try {
    let match = {};
    if (id) match["_id"] = id;
    if (user_id) match["user_id"] = user_id;
    if (order_id) match["order_id"] = order_id;
    if (agent_id) match["agent_id"] = agent_id;
    if (buyer_id) match["buyer_id"] = buyer_id;
    if (payment_method) match["payment_method"] = payment_method;
    if (payment_status) match["payment_status"] = payment_status;
    if (status) match["status"] = status;
    if (type) match["type"] = type;
    if (zonal_id) match["zonal_id"] = zonal_id;
    if (rsm_id) match["rsm_id"] = rsm_id;
    if (asm_id) match["asm_id"] = asm_id;
    if (national_id) match["national_id"] = national_id;
    if (category) match["category"] = category;
    if (season) match["season"] = season;

    if (count) return await Order.countDocuments(match);

    const data = await Order.find(match)
      .sort({ _id: -1 })
      .populate({ path: "buyer_id", select: "name" })
      .populate({ path: "agent_id", select: ["agent_agency", "name", "agent_county_code"] })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    if (data.length) return formatMongoData(data);
    else return [];
  } catch (error) {
    console.log("Something went wrong: Service: findOrders", error);
    return { status: false, message: error };
  }
};

module.exports.findTemporaryOrders = async ({
  skip = 0,
  limit = 0,
  order_id = "",
  status = "",
  agent_id = "",
  id = "",
  buyer_id = "",
  payment_status = "",
  payment_method = "",
  type = "",
  count = false,
  user_id = "",
  zonal_id = "",
  rsm_id = "",
  asm_id = "",
  national_id = "",
  category = "",
  season = "",
}) => {
  try {
    let match = {};
    if (id) match["_id"] = id;
    if (user_id) match["user_id"] = user_id;
    if (order_id) match["order_id"] = order_id;
    if (agent_id) match["agent_id"] = agent_id;
    if (buyer_id) match["buyer_id"] = buyer_id;
    if (payment_method) match["payment_method"] = payment_method;
    if (payment_status) match["payment_status"] = payment_status;
    if (status) match["status"] = status;
    if (type) match["type"] = type;
    if (zonal_id) match["zonal_id"] = zonal_id;
    if (rsm_id) match["rsm_id"] = rsm_id;
    if (asm_id) match["asm_id"] = asm_id;
    if (national_id) match["national_id"] = national_id;
    if (category) match["category"] = category;
    if (season) match["season"] = season;

    if (count) return await TempOrder.countDocuments(match);

    const data = await TempOrder.find(match)
      .sort({ _id: -1 })
      .populate({ path: "buyer_id", select: "name" })
      .populate({ path: "agent_id", select: ["agent_agency", "name", "agent_county_code"] })
      .populate({ path: "user_id", select: "name" })
      .populate({ path: "asm_id", select: "name" })
      .populate({ path: "rsm_id", select: "name" })
      .populate({ path: "zonal_id", select: "name" })
      .populate({ path: "national_id", select: "name" })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    if (data.length) return formatMongoData(data);
    else return [];
  } catch (error) {
    console.log("Something went wrong: Service: findTemporaryOrders", error);
    return { status: false, message: error };
  }
};

module.exports.findLineItem = async ({
  skip = 0,
  limit = 0,
  order_id = "",
  status = "",
  material_no = "",
  id = "",
  shade = "",
  count = false,
}) => {
  try {
    let match = {};
    if (id) match["_id"] = id;
    if (order_id) match["order_id"] = order_id;
    if (material_no) match["material_no"] = material_no;
    if (status) match["status"] = status;
    if (shade) match["shade"] = shade;

    if (count) return await LineItem.countDocuments(match);

    const product = await LineItem.find(match).sort({ _id: -1 }).skip(parseInt(skip)).limit(parseInt(limit));

    if (product.length) return formatMongoData(product);
    else return [];
  } catch (error) {
    console.log("Something went wrong: Service: findLineItem", error);
    return { status: false, message: error };
  }
};

module.exports.findTemporaryLineItem = async ({
  skip = 0,
  limit = 0,
  order_id = "",
  status = "",
  material_no = "",
  id = "",
  shade = "",
  count = false,
}) => {
  try {
    let match = {};
    if (id) match["_id"] = id;
    if (order_id) match["order_id"] = order_id;
    if (material_no) match["material_no"] = material_no;
    if (status) match["status"] = status;
    if (shade) match["shade"] = shade;

    if (count) return await TempLineItem.countDocuments(match);

    const product = await TempLineItem.find(match).sort({ _id: -1 }).skip(parseInt(skip)).limit(parseInt(limit));

    if (product.length) return formatMongoData(product);
    else return [];
  } catch (error) {
    console.log("Something went wrong: Service: findTemporaryLineItem", error);
    return { status: false, message: error };
  }
};

module.exports.findUlcConversionData = async ({ skip = 0, limit = 0, meters = "", ulc = "", id = "", count = false }) => {
  try {
    let match = {};

    if (id) match["_id"] = id;
    if (ulc) match["ulc"] = ulc;
    if (meters) match["meters"] = meters;

    if (count) return await UlcConversion.countDocuments(match);

    const data = await UlcConversion.find(match).sort({ ulc: -1 }).skip(parseInt(skip)).limit(parseInt(limit));

    if (data.length) return formatMongoData(data);
    else return [];
  } catch (error) {
    console.log("Something went wrong: Service: findUlcConversionData", error);
    return { status: false, message: error };
  }
};

module.exports.pdfGeneretorByOrderId = async ({ orderId }) => {
  try {
    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    let order = await Order.findOne({ order_id: orderId })
      .populate({ path: "buyer_id", select: "name" })
      .populate({ path: "agent_id", select: ["agent_agency", "name"] })
      .sort({ _id: -1 });
    if (order) {
      order = formatMongoData(order);
      // let buyer = await UserMaster.findById({ _id: order.buyer_id });
      // buyer = formatMongoData(buyer);
      let buyer_name = order.buyer_id.name;
      let agency_name = order.agent_id.agent_agency;
      let random = Math.floor(Math.random() * 10000000 + 1);
      order.createdAt = moment(order.createdAt).format("DD-MM-YYYY");
      let order_line_item = await LineItem.find({ order_id: orderId }).sort({ order_id: -1 });
      order_line_item = formatMongoData(order_line_item);

      if (order_line_item.length) {
        for (let item of order_line_item) {
          let total_meters = 0.0;
          // let exMillPrice = 0.0;
          let total_value = 0.0;
          let ulc_conversion = await UlcConversion.findOne({ ulc: item.ulc });
          let product = await Product.findById(item.product_id);
          if (ulc_conversion) {
            total_meters += parseFloat(item.units) * parseFloat(ulc_conversion.meters);
            // exMillPrice += (parseFloat(product.EX_FACTORY_PRICE) * parseFloat(item.units));
            total_value += parseFloat(item.units) * parseFloat(product.EX_FACTORY_PRICE) * parseFloat(ulc_conversion.meters);
          }
          item["total_meters"] = total_meters;
          // item['exMillPrice'] = exMillPrice;
          item["total_value"] = total_value;
        }
      }
      //geneating pdf
      ejs.renderFile(
        path.join(__dirname, "../helpers/invoiceTemplate", "index.ejs"),
        {
          order_id: orderId,
          order,
          order_line_item,
          buyer_name,
          agency_name,
          season: order.season,
          area_code: order.area_code,
        },
        async (err, data) => {
          if (err) {
            console.log("error", err);
            return res.send(err);
          } else {
            // console.log(data);
            let options = {
              height: "11.25in",
              width: "8.5in",
              header: {
                height: "20mm",
              },
              footer: {
                height: "20mm",
              },
            };

            await pdf
              .create(data, options)
              .toFile(path.join(__dirname, `../uploads/invoice/${orderId}-${random}.pdf`), async (err, data) => {
                if (err) console.log(err);
                else console.log("file created");
              });
          }
        }
      );
      await sleep(1500);
      return `${orderId}-${random}`;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Something went wrong: Service: pdfGeneretorByOrderId", error);
    return { status: false, message: error };
  }
};

module.exports.findOrdersForExport = async ({
  skip = 0,
  limit = 0,
  order_id = "",
  status = "",
  agent_id = "",
  id = "",
  buyer_id = "",
  payment_status = "",
  payment_method = "",
  season = "",
  type = "",
  count = false,
  user_id = "",
  zonal_id = "",
  rsm_id = "",
  asm_id = "",
  national_id = "",
  category = "",
  start_date = "",
  end_date = "",
}) => {
  try {
    let match = {};
    if (id) match["_id"] = id;
    if (user_id) match["user_id"] = user_id;
    if (order_id) match["order_id"] = order_id;
    if (agent_id) match["agent_id"] = agent_id;
    if (buyer_id) match["buyer_id"] = buyer_id;
    if (payment_method) match["payment_method"] = payment_method;
    if (payment_status) match["payment_status"] = payment_status;
    if (status) match["status"] = status;
    if (type) match["type"] = type;
    if (zonal_id) match["zonal_id"] = zonal_id;
    if (rsm_id) match["rsm_id"] = rsm_id;
    if (asm_id) match["asm_id"] = asm_id;
    if (national_id) match["national_id"] = national_id;
    if (category) match["category"] = category;
    if (season) match["season"] = season;
    if (start_date != "" && end_date != "") {
      end_date = moment(end_date).add(1, "days").format("YYYY-MM-DD");
      match["createdAt"] = {
        $gte: new Date(start_date),
        $lt: new Date(end_date),
        // $lte: new Date(end_date) + " 23:59:59",
      };
    }
    if (count) return await Order.countDocuments(match);

    const data = await Order.find(match)
      .sort({ _id: -1 })
      .populate({ path: "buyer_id", select: "name" })
      .populate({ path: "user_id", select: "name" })
      .populate({ path: "asm_id", select: "name" })
      .populate({ path: "rsm_id", select: "name" })
      .populate({ path: "zonal_id", select: "name" })
      .populate({ path: "national_id", select: "name" })
      .populate({ path: "agent_id", select: ["agent_agency", "name"] })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    if (data.length) return formatMongoData(data);
    else return [];
  } catch (error) {
    console.log("Something went wrong: Service: findOrdersForExport", error);
    return { status: false, message: error };
  }
};

module.exports.bulkDeleteFromTemporaryOrder = async ({ user_id }) => {
  try {
    checkObjectId(user_id);
    const product = await TempOrder.deleteMany({ user_id: user_id });

    return true;
    // if (product.deletedCount > 0) return true;
    // else return false;
  } catch (error) {
    console.log("Something went wrong: Service: bulkDeleteFromTemporaryOrder", error);
    return { status: false, message: error };
  }
};
module.exports.bulkDeleteFromTemporaryLineItem = async ({ order_id }) => {
  try {
    const product = await TempLineItem.deleteMany({ order_id: order_id });

    return true;
    // if (product.deletedCount > 0) return true;
    // else return false;
  } catch (error) {
    console.log("Something went wrong: Service: bulkDeleteFromTemporaryLineItem", error);
    return { status: false, message: error };
  }
};


