const constants = require("../constants");
const orderService = require("../services/orderService");
const userService = require("../services/userLoginService");
const cartService = require("../services/cartService");
const productService = require("../services/productService");
const jwt = require("jsonwebtoken");
const rppService = require("../services/rppService");
const rppController = require("../controllers/rppController");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const fs = require("fs");
const axios = require("axios");
const moment = require("moment");
const { formatMongoData, checkObjectId } = require("../helpers/dbHelper");
const csvtojson = require('csvtojson');

// importcsvorder file
module.exports.importcsvorder = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.file) {
      throw new Error('File not found');
    }
    else {
      console.log("File found in server");

      let filePath = '';
      let oldpath = req.file.path;
      let cur_date = new Date();
      let file_date = moment(cur_date).format("DD-MM-YYYY");
      console.log(oldpath);
      let random_number = Math.floor((Math.random() * 10000000000) + 1);
      filePath = `./uploads/main/ ${random_number}__${file_date}__${req.file.originalname}`;
      fs.rename(oldpath, filePath, function (err) {
        if (err) throw err;
      });

      let jsonData;
      await csvtojson().fromFile(filePath)
        .then(csvorderdata => {
          jsonData = csvorderdata
        }).catch(err => {
          console.log(err);
        });
      console.log("Data from controller..");
      req.body.jsonData = jsonData;
      const responseFromService = await orderService.importcsvorder(req.body);
      response.status = 200;
      response.message = "Success";
      response.body = responseFromService;
    }

  } catch (error) {
    console.log('Something went wrong: Controller: importcsvorder', error.message);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
}

module.exports.createTemporaryOrder = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    const { category, season, booking_sub_category, items, buyer_id } = req.body;
    const { user_id, user_role } = req.body;
    const cart_details = await cartService.find_cart_items({ user_id });
    if (!cart_details.length) throw new Error(`Please insert the products into cart first.`);

    let access_request = false;
    if (!req.body) throw new Error(`You are not authorised!!!`);
    let authorised_access = ["zonal_manager", "rsm", "asm", "agent", "buyer", "national_head", "special_login"];
    if (authorised_access.includes(user_role)) access_request = true;
    else throw new Error(`You are not authorised!!!`);
    if (!access_request) throw new Error(`You are not authorised!!!`);

    // let cur_date = new Date();
    // cur_date.setDate(cur_date.getDate() + 10)
    // let deliveryDate = moment(cur_date).format("DD-MM-YYYY");
    let count = 0;

    let unique_key = await orderService.uniqueCodeGeneratorForTemporaryOrder({ category });
    checkObjectId(buyer_id);
    if (!buyer_id) throw new Error(`Please select a buyer!!!`);

    let ZONAL1;
    let RSM1;
    let ASM1;
    let AGENT1;
    let NH1;
    let BUYER = await userService.searchUsersFromUserMapping({ buyer_id: buyer_id });
    if (!BUYER.length) throw new Error(`Please select a buyer!!!`);

    if (BUYER[0].nh_email) {
      NH1 = await userService.searchUsersWithOutRegex({ email: BUYER[0].nh_email });
      BUYER[0].national_id = NH1[0].id;
    }
    if (BUYER[0].zsm_email) {
      ZONAL1 = await userService.searchUsersWithOutRegex({ email: BUYER[0].zsm_email });
      BUYER[0].zonal_id = ZONAL1[0].id;
    }
    if (BUYER[0].rsm_email) {
      RSM1 = await userService.searchUsersWithOutRegex({ email: BUYER[0].rsm_email });
      BUYER[0].rsm_id = RSM1[0].id;
    }
    if (BUYER[0].asm_email) {
      ASM1 = await userService.searchUsersWithOutRegex({ email: BUYER[0].asm_email });
      BUYER[0].asm_id = ASM1[0].id;
    }
    if (BUYER[0].agent_email) {
      AGENT1 = await userService.searchUsersWithOutRegex({ email: BUYER[0].agent_email });
      BUYER[0].agent_id = AGENT1[0].id;
    }
    //TODO: START
    // let BUYER = await userService.searchLoginUser({ id: buyer_id });
    let ZONAL;
    let RSM;
    let ASM;
    let AGENT;
    if (BUYER[0].zonal_id) {
      ZONAL = BUYER[0].zonal_id;
    } else {
      ZONAL = BUYER[0].national_id;
    }
    if (ZONAL) {
      if (BUYER[0].rsm_id) {
        RSM = BUYER[0].rsm_id;
      } else {
        RSM = ZONAL;
      }
      if (RSM) {
        if (BUYER[0].asm_id) {
          ASM = BUYER[0].asm_id;
        } else {
          ASM = RSM;
        }
        if (ASM) {
          if (BUYER[0].agent_id) {
            AGENT = BUYER[0].agent_id;
          } else {
            AGENT = ASM;
          }
        }
      }
    }
    //TODO: END

    let total_value = 0.0;
    let total_units = 0.0;
    let total_meters = 0.0;
    let exMillPrice = 0.0;

    for (let item of items) {
      const { material_no, shade, delivery_period, ulc, units, product_id } = item;
      let product = await productService.find_material({ id: product_id });
      if (!product.length) throw new Error("Product not found");
      await orderService.insertTemporaryLineItem({
        material_no,
        delivery_period,
        ulc,
        units,
        shade,
        serial_no: product[0].SEQUENCE_NUMBER_OF_MATERIAL,
        order_id: unique_key,
        status: "temporary",
        ex_mill_price: product[0].EX_FACTORY_PRICE,
        product_id,
      }); // season
      let ulc_conversion = await orderService.findUlcConversionData({ ulc: ulc });
      if (ulc_conversion.length) {
        total_units += parseFloat(units);
        total_meters += parseFloat(units) * parseFloat(ulc_conversion[0].meters);
        exMillPrice += parseFloat(product[0].EX_FACTORY_PRICE) * parseFloat(units);
        total_value += parseFloat(units) * parseFloat(product[0].EX_FACTORY_PRICE) * parseFloat(ulc_conversion[0].meters);
      }
      count++;
    }
    if (count == items.length && unique_key) {
      let insert_info = {
        user_id,
        user_role,
        order_id: unique_key,
        area_code: BUYER.area_code,
        // agent_id: agent_id,
        buyer_id: buyer_id,
        status: "temporary",
        payment_status: "pending",
        payment_method: "cash_on_delivery",
        season: season,
        category: category,
        booking_sub_category,
        area_code: BUYER[0].buyer_area_code,
        total_units: total_units.toString(),
        total_meters: total_meters.toString(),
        exMillPrice: exMillPrice.toString(),
        total_value: total_value.toString(),
      };
      if (AGENT) insert_info["agent_id"] = AGENT;
      if (RSM) insert_info["rsm_id"] = RSM;
      if (BUYER[0].nh_email) insert_info["national_id"] = BUYER[0].national_id;
      if (ZONAL) insert_info["zonal_id"] = ZONAL;
      if (ASM) insert_info["asm_id"] = ASM;

      let placed_order = await orderService.insertTemporaryOrder(insert_info);
      if (placed_order) {
        await cartService.bulkDeleteByUserId({ user_id: user_id });
        // Promise.all([rppController.pointCalculationAfterOrder({ order_id: unique_key })]);

        response.status = 201;
        // response.message = (order_status === 'hold') ? constants.orderMessage.ORDER_HOLD : constants.orderMessage.ORDER_PLACED;
        response.body = {
          // delivery_date: deliveryDate,
          // order_no: placed_order.order_id,
          temp_order_id: placed_order.id,
        };
      }
    } else response.message = constants.orderMessage.TRY_AGAIN;
  } catch (error) {
    console.log("Something went wrong: Controller: createTemporaryOrder", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

module.exports.transferToCart = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let responseFromService;
    let user_access = false;
    const { user_id, user_role, email, order_id, status } = req.body;

    if (!req.body) throw new Error(`You are not authorised!!!`);
    let authorised_access = ["zonal_manager", "rsm", "asm", "agent", "buyer", "national_head", "special_login"];
    if (authorised_access.includes(user_role)) user_access = true;
    else throw new Error(`You are not authorised!!!`);
    const re_order = await orderService.findOrders({ id: order_id });
    if (!re_order.length) throw new Error(`Please insert the products into cart first.`);
    if (!re_order[0].buyer_id.id) throw new Error(`Please select a buyer!!!`);

    if (status === "cancel" && order_id && re_order.length) {
      let prev_key = re_order[0].order_id.split("");
      prev_key.pop();
      unique_key = prev_key.join("");
      unique_key = `${unique_key}C`;
      await orderService.updateOrder({ id: prev_id, updateInfo: { order_id: unique_key, status: "calcel" } });
    }
    if (status === "re_order") {
      await cartService.bulkDeleteByUserId({ user_id: user_id });
      // if (!re_order[0].agent_id.id) throw new Error(`Please select a agent!!!`);
      let BUYER = await userService.searchLoginUser({ id: re_order[0].buyer_id.id });
      if (!BUYER) throw new Error(`Please select a buyer!!!`);
      let re_order_line_items = await orderService.findLineItem({ order_id: re_order[0].order_id });
      if (!re_order_line_items.length) throw new Error(`${constants.orderMessage.TRY_AGAIN}`);

      for (let item of re_order_line_items) {
        const { material_no, delivery_period, ulc, units, shade, season, product_id, category } = item;
        if (units) {
          checkObjectId(product_id);
          let product = await productService.find_material({ id: product_id });
          if (product.length) {
            let data = {
              user_id,
              user_role,
              material_no,
              delivery_period,
              ulc,
              units,
              serial_no: product[0].SEQUENCE_NUMBER_OF_MATERIAL,
              shade,
              season: re_order[0].season,
              category: re_order[0].category,
              ex_mill_price: product[0].EX_FACTORY_PRICE,
              product_id,
              buyer_id: BUYER.id,
              booking_sub_category: re_order[0].booking_sub_category,
              status: "Active",
            };
            if (re_order[0].agent_id.id) data["agent_id"] = re_order[0].agent_id.id;
            responseFromService = await cartService.insertCartDetails(data);
          }
        }
      }
    }
    if (responseFromService) {
      response.status = 201;
      response.message = constants.cartMessage.PRODUCT_ADD;
      if (status !== "cancel") response.body = { agent_id: re_order[0].agent_id.id, buyer_id: BUYER.id };
      return res.status(response.status).send(response);
    }
    if (!cartItems.length) {
      response.status = 400;
      response.message = constants.cartMessage.TRY_AGAIN;
    }
  } catch (error) {
    console.log("Something went wrong: Controller: transferToCart", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

module.exports.createOrder = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    const { order_id, order_status, temp_order_id, user_id, user_role } = req.body;
    checkObjectId(temp_order_id);
    let access_request = false;
    if (!req.body) throw new Error(`You are not authorised!!!`);
    let authorised_access = ["zonal_manager", "rsm", "asm", "agent", "buyer", "national_head", "special_login"];
    if (authorised_access.includes(user_role)) access_request = true;
    else throw new Error(`You are not authorised!!!`);
    if (!access_request) throw new Error(`You are not authorised!!!`);

    const temp_order = await orderService.findTemporaryOrders({ id: temp_order_id });
    if (!temp_order.length) throw new Error(`Please insert the products into cart first.`);

    //previous order
    let prev_order;
    if (order_id && order_id != "") {
      checkObjectId(order_id);
      prev_order = await orderService.findOrders({ id: order_id });
      if (prev_order.length) await orderService.deleteLineItem({ order_id: prev_order[0].order_id });
    }

    let cur_date = new Date(temp_order[0].createdAt);
    cur_date.setDate(cur_date.getDate() + 10);
    let deliveryDate = moment(cur_date).format("DD-MM-YYYY");
    let count = 0;

    let unique_key;
    if (order_id && prev_order.length) {
      let prev_key = prev_order[0].order_id.split("");
      prev_key.pop();
      unique_key = prev_key.join("");
    } else unique_key = await orderService.uniqueCodeGeneratorForOrder({ category: temp_order[0].category });
    if (order_status && order_status === "hold") unique_key = `${unique_key}H`;
    if (order_status && order_status === "cancel") unique_key = `${unique_key}C`;
    if (temp_order && temp_order.length) {
      let temp_line_items = await orderService.findTemporaryLineItem({ order_id: temp_order[0].order_id });
      if (!temp_line_items.length) throw new Error(`${constants.orderMessage.TRY_AGAIN}`);

      for (let item of temp_line_items) {
        const { material_no, shade, delivery_period, ulc, units, product_id } = item;
        let product = await productService.find_material({ id: product_id });
        if (!product.length) throw new Error("Product not found");
        await orderService.insertLineItem({
          material_no,
          delivery_period,
          ulc,
          units,
          shade,
          serial_no: product[0].SEQUENCE_NUMBER_OF_MATERIAL,
          order_id: unique_key,
          status: order_status.toLowerCase(),
          ex_mill_price: product[0].EX_FACTORY_PRICE,
          product_id,
        });
        count++;
      }
      if (count == temp_line_items.length && unique_key) {
        let insert_info = {
          user_id: temp_order[0].user_id.id,
          user_role: temp_order[0].user_role,
          order_id: unique_key,
          area_code: temp_order[0].area_code,
          buyer_id: temp_order[0].buyer_id.id,
          payment_status: temp_order[0].payment_status,
          payment_method: temp_order[0].payment_method,
          season: temp_order[0].season,
          category: temp_order[0].category,
          booking_sub_category: temp_order[0].booking_sub_category,
          area_code: temp_order[0].area_code,
          status: order_status,
          total_units: temp_order[0].total_units,
          total_meters: temp_order[0].total_meters,
          exMillPrice: temp_order[0].exMillPrice,
          total_value: temp_order[0].total_value,
          agent_id: temp_order[0].agent_id.id,
          rsm_id: temp_order[0].rsm_id.id,
          national_id: temp_order[0].national_id.id,
          zonal_id: temp_order[0].zonal_id.id,
          asm_id: temp_order[0].asm_id.id,
          expected_delivery_date: new Date(cur_date),
        };
        let placed_order;
        if (order_id) {
          let prev_id = prev_order[0].id;
          placed_order = await orderService.updateOrder({ id: prev_id, updateInfo: insert_info });
        } else placed_order = await orderService.insertOrder(insert_info);
        if (placed_order) {
          if (order_status === "active") {
            let confirm_info;
            for (let item of temp_line_items) {
              const { material_no } = item;
              confirm_info = {
                user_id,
                order_mid: placed_order.id,
                user_role,
                buyer_id: placed_order.buyer_id,
                season: placed_order.season,
                material_no: material_no,
                category: placed_order.category,
              };
              await orderService.confirmOrderMap(confirm_info);
            }
          }
          await orderService.bulkDeleteFromTemporaryOrder({ user_id: user_id });
          await orderService.bulkDeleteFromTemporaryLineItem({ order_id: temp_order[0].order_id });
          await cartService.bulkDeleteByUserId({ user_id: user_id });
          // Promise.all([rppController.pointCalculationAfterOrder({ order_id: unique_key })]);

          response.status = 201;
          response.message = order_status === "hold" ? constants.orderMessage.ORDER_HOLD : constants.orderMessage.ORDER_PLACED;
          response.body = { order_no: placed_order.order_id };
          if (order_status === "active") response.body["delivery_date"] = deliveryDate;
        }
      } else response.message = constants.orderMessage.TRY_AGAIN;
    }
  } catch (error) {
    console.log("Something went wrong: Controller: createOrder", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

module.exports.orderList = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let responseFromService = [];
    let search_key = {};
    let authorised = false;
    const { category, zonal, rsm, asm, agent, buyer, national, orderId, skip, limit, season, status } = req.query;
    if (!req.body) throw new Error(`You are not authorised!!!`);
    const { user_id, user_role } = req.body;
    let authorised_access = ["zonal_manager", "rsm", "asm", "agent", "buyer", "national_head", "special_login"];

    if (authorised_access.includes(user_role)) {
      if (category) search_key["category"] = category;
      if (season) search_key["season"] = season;
      if (zonal) search_key["zonal_id"] = zonal;
      if (rsm) search_key["rsm_id"] = rsm;
      if (asm) search_key["asm_id"] = asm;
      if (agent) search_key["agent_id"] = agent;
      if (buyer) search_key["buyer_id"] = buyer;
      if (orderId) search_key["order_id"] = orderId;
      if (national) search_key["national_id"] = national;
      if (skip) search_key["skip"] = skip;
      if (limit) search_key["limit"] = limit;
      if (status) search_key["status"] = status;

      if (user_role == "national_head") search_key["national_id"] = user_id;
      if (user_role == "zonal_manager") search_key["zonal_id"] = user_id;
      if (user_role == "rsm") search_key["rsm_id"] = user_id;
      if (user_role == "asm") search_key["asm_id"] = user_id;
      if (user_role == "agent") search_key["agent_id"] = user_id;
      if (user_role == "buyer") search_key["buyer_id"] = user_id;
      // if (user_role == 'national_head') search_key['user_id'] = user_id;
      // if (user_role == 'zonal_manager') search_key['user_id'] = user_id;
      // if (user_role == 'rsm') search_key['user_id'] = user_id;
      // if (user_role == 'asm') search_key['user_id'] = user_id;
      // if (user_role == 'agent') search_key['user_id'] = user_id;
      // if (user_role == 'buyer') search_key['user_id'] = user_id;
      authorised = true;
    } else throw new Error(`You are not authorised!!!`);

    if (search_key && Object.keys(search_key).length !== 0 && authorised)
      responseFromService = await orderService.findOrders({ ...search_key });
    // if (authorised) responseFromService = await orderService.findOrders({ ...search_key });
    if (responseFromService.length) {
      for (let item of responseFromService) {
        let AGENT;
        let BUYER;
        if (item.agent_id) AGENT = item.agent_id;
        if (item.buyer_id) BUYER = item.buyer_id;

        item["agent_name"] = AGENT ? AGENT.name : "";
        item["agent_id"] = AGENT ? AGENT.id : "";
        item["agency"] = AGENT ? `${AGENT.agent_agency}-${AGENT.agent_county_code}` : "";
        item["buyer_name"] = BUYER ? BUYER.id : "";
        item["buyer_id"] = BUYER ? BUYER.name : "";
        item["collection"] = item.collection_period ? item.collection_period : "";
        item["order_on"] = moment(item.createdAt).format("DD-MM-YYYY");

        delete item.user_id;
        delete item.payment_status;
        delete item.payment_method;
        delete item.user_role;
        delete item.updatedAt;
        delete item.agent_id;
        delete item.buyer_id;
        delete item.rsm_id;
        delete item.asm_id;
        delete item.national_id;
        delete item.zonal_id;
      }
      response.status = 200;
      response.message = constants.orderMessage.RESOURCE_FOUND;
      search_key["count"] = true;
      response.count = await orderService.findOrders({ ...search_key });
      response.body = { data: responseFromService };
    } else {
      response.status = 202;
      response.message = constants.orderMessage.RESOURCE_NOT_FOUND;
    }
  } catch (error) {
    console.log("Something went wrong: Controller: orderList", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

module.exports.singleOrderDetails = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let items = [];
    checkObjectId(req.params.id);
    let responseFromService = [];
    let access = false;
    if (!req.body) throw new Error(`You are not authorised!!!`);
    const { user_id, user_role } = req.body;
    let authorised_access = ["zonal_manager", "rsm", "asm", "agent", "buyer", "national_head", "special_login"];
    if (authorised_access.includes(user_role)) access = true;

    if (access) responseFromService = await orderService.findOrders({ id: req.params.id });
    if (responseFromService.length) {
      let lineItems = await orderService.findLineItem({
        order_id: responseFromService[0].order_id,
        skip: req.query.skip,
        limit: req.query.limit,
      });
      for (let item of lineItems) {
        let pdt = await productService.find_material({ id: item.product_id });
        item["img"] = pdt.length
          ? pdt[0].IMG_URL
            ? pdt[0].IMG_URL
            : `https://myraymond.com/media/no-image.jpg`
          : `https://myraymond.com/media/no-image.jpg`;
        delete item.order_id;
        delete item.createdAt;
        delete item.updatedAt;
        item.mrp = "9999";
        items.push(item);
      }
      let AGENT;
      let BUYER;
      if (responseFromService[0].agent_id) AGENT = responseFromService[0].agent_id;
      if (responseFromService[0].buyer_id) BUYER = responseFromService[0].buyer_id;

      responseFromService[0]["agent_name"] = AGENT ? AGENT.name : "";
      responseFromService[0]["agency"] = AGENT ? `${AGENT.agent_agency}-${AGENT.agent_county_code}` : "";
      responseFromService[0]["buyer_name"] = BUYER ? BUYER.name : "";
      responseFromService[0]["collection"] = responseFromService[0].collection_period;
      responseFromService[0]["order_on"] = moment(responseFromService[0].createdAt).format("DD-MM-YYYY");

      responseFromService[0]["total_mrp"] = "001001";
      responseFromService[0]["items"] = items;

      delete responseFromService[0].user_id;
      delete responseFromService[0].payment_status;
      delete responseFromService[0].payment_method;
      delete responseFromService[0].user_role;
      delete responseFromService[0].updatedAt;
      delete responseFromService[0].agent_id;
      delete responseFromService[0].buyer_id;
      delete responseFromService[0].collection_period;

      response.status = 200;
      response.message = constants.orderMessage.RESOURCE_FOUND;
      response.count = await orderService.findOrders({ user_id, count: true });
      response.body = { data: responseFromService };
    } else {
      response.status = 202;
      response.message = constants.orderMessage.RESOURCE_NOT_FOUND;
    }
  } catch (error) {
    console.log("Something went wrong: Controller: singleOrderDetails", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

//generate pdf
module.exports.generateOrderpdf = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let access_request = false;
    if (!req.body) throw new Error(`You are not authorised!!!`);
    const { user_id, user_role } = req.body;
    let authorised_access = ["zonal_manager", "rsm", "asm", "agent", "buyer", "national_head", "special_login"];
    if (authorised_access.includes(user_role)) access_request = true;
    else throw new Error(`You are not authorised!!!`);
    if (!access_request) throw new Error(`You are not authorised!!!`);

    let data = await orderService.pdfGeneretorByOrderId({ orderId: req.query.orderId });
    if (data) {
      response.status = 200;
      response.message = constants.orderMessage.DOWNLOADED;
      response.body = {
        link: process.env.MEDIA_PATH + `invoice/${data}.pdf`,
      };
    } else {
      response.message = constants.orderMessage.TRY_AGAIN;
    }
  } catch (error) {
    console.log("Something went wrong: Controller: orderpdf", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

module.exports.exportOrders = async (req, res) => {
  let access_request = false;
  if (!req.body) throw new Error(`You are not authorised!!!`);
  const { user_id, user_role } = req.body;
  let authorised_access = ["zonal_manager", "rsm", "asm", "agent", "buyer", "national_head", "special_login"];
  if (authorised_access.includes(user_role)) access_request = true;
  else throw new Error(`You are not authorised!!!`);
  if (!access_request) throw new Error(`You are not authorised!!!`);

  let random = Math.floor(Math.random() * 10000000 + 1);
  let createFolder = process.env.PHYSICAL_MEDIA_PATH + "order_export/";
  if (!fs.existsSync(createFolder)) fs.mkdirSync(createFolder);

  let datetime = new Date();
  let fileName = `${random}_` + datetime.toISOString().slice(0, 10) + ".csv";
  const csvWriter = createCsvWriter({
    path: createFolder + fileName,
    header: [
      { id: "order_by", title: "ORDER CREATED BY" },
      { id: "order_for", title: "ORDER FOR" },
      { id: "rsm_id", title: "RSM" },
      { id: "agent_id", title: "AGENT" },
      { id: "agent_agency", title: "AGENT AGENCY" },
      { id: "asm_id", title: "ASM" },
      { id: "national_id", title: "NATIONAL" },
      { id: "zonal_id", title: "ZONAL" },
      { id: "order_id", title: "ORDER NO" },
      { id: "payment_status", title: "PAYMENT STATUS" },
      { id: "payment_method", title: "PAYMENT METHOD" },
      { id: "season", title: "SEASON" },
      { id: "status", title: "STATUS" },
      { id: "category", title: "CATEGORY" },
      { id: "total_units", title: "TOTAL UNITS" },
      { id: "total_meters", title: "TOTAL METERS" },
      { id: "exMillPrice", title: "EX-MILL-PRICE" },
      { id: "total_value", title: "TOTAL VALUE" },
      { id: "createdAt", title: "CREATED DATE" },
    ],
  });
  let response = { ...constants.defaultServerResponse };
  try {
    let records = [];
    let exists = [];
    let search_key = {};
    let authorised = false;
    const { category, zonal, rsm, asm, agent, buyer, national, orderId, skip, limit, season, start_date, end_date } = req.query;

    if (!req.body) throw new Error(`You are not authorised!!!`);
    const { user_id, user_role } = req.body;

    if (authorised_access.includes(user_role)) {
      search_key["status"] = "Active";
      if (category) search_key["category"] = category;
      if (season) search_key["season"] = season;
      if (zonal) search_key["zonal_id"] = zonal;
      if (rsm) search_key["rsm_id"] = rsm;
      if (asm) search_key["asm_id"] = asm;
      if (agent) search_key["agent_id"] = agent;
      if (buyer) search_key["buyer_id"] = buyer;
      if (orderId) search_key["order_id"] = orderId;
      if (national) search_key["national_id"] = national;
      if (skip) search_key["skip"] = skip;
      if (limit) search_key["limit"] = limit;
      if (start_date) search_key["start_date"] = start_date;
      if (end_date) search_key["end_date"] = end_date;

      if (user_role == "national_head") search_key["national_id"] = user_id;
      if (user_role == "zonal_manager") search_key["zonal_id"] = user_id;
      if (user_role == "rsm") search_key["rsm_id"] = user_id;
      if (user_role == "asm") search_key["asm_id"] = user_id;
      if (user_role == "agent") search_key["agent_id"] = user_id;
      if (user_role == "buyer") search_key["buyer_id"] = user_id;
      // if (user_role == 'national_head') search_key['user_id'] = user_id;
      // if (user_role == 'zonal_manager') search_key['user_id'] = user_id;
      // if (user_role == 'rsm') search_key['user_id'] = user_id;
      // if (user_role == 'asm') search_key['user_id'] = user_id;
      // if (user_role == 'agent') search_key['user_id'] = user_id;
      // if (user_role == 'buyer') search_key['user_id'] = user_id;
      authorised = true;
    } else throw new Error(`You are not authorised!!!`);

    if (authorised) exists = await orderService.findOrdersForExport({ ...search_key });
    if (exists.length) {
      for (let exist of exists) {
        let BUYER;
        let ORDER;
        let ASM;
        let RSM;
        let ZONAL;
        let NH;
        let AGENT;
        if (exist.buyer_id) BUYER = exist.buyer_id;
        if (exist.user_id) ORDER = exist.user_id;
        if (exist.asm_id) ASM = exist.asm_id;
        if (exist.rsm_id) RSM = exist.rsm_id;
        if (exist.zonal_id) ZONAL = exist.zonal_id;
        if (exist.national_id) NH = exist.national_id;
        if (exist.agent_id) AGENT = exist.agent_id;

        records.push({
          order_by: ORDER ? ORDER.name : "",
          order_for: BUYER ? BUYER.name : "",
          rsm_id: RSM ? RSM.name : "",
          agent_id: AGENT ? AGENT.name : "",
          agent_agency: AGENT ? `${AGENT.agent_agency}-${AGENT.agent_county_code}` : "",
          asm_id: ASM ? ASM.name : "",
          national_id: NH ? NH.name : "",
          zonal_id: ZONAL ? ZONAL.name : "",
          order_id: exist.order_id,
          payment_status: exist.payment_status.toUpperCase(),
          payment_method: exist.payment_method.replace(/_/g, " ").toUpperCase(),
          season: exist.season,
          status: exist.status,
          category: exist.category.replace(/_/g, " ").toUpperCase(),
          total_units: exist.total_units,
          total_meters: exist.total_meters,
          exMillPrice: exist.exMillPrice,
          total_value: exist.total_value,
          createdAt: exist.createdAt ? moment(exist.createdAt).format("DD-MM-YYYY") : "",
        });
      }

      csvWriter.writeRecords(records);

      response.status = 200;
      response.message = `Log file exported.`;
      response.body = {
        downloadLink: process.env.MEDIA_PATH + "order_export/" + fileName,
      };
    } else {
      response.status = 202;
      response.message = `No data found`;
    }
  } catch (error) {
    console.log("Something went wrong: Controller: exportOrders", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};
