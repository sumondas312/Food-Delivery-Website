const constants = require("../constants");
const productService = require("../services/productService");
const orderService = require("../services/orderService");
const axios = require("axios");
const bcrypt = require("bcrypt");
const moment = require("moment");

module.exports.searchMaterial = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let date = new Date();
    let month = date.getMonth() + 1;

    let access_request = false;
    if (!req.body) throw new Error(`You are not authorised!!!`);
    const { user_id, user_role } = req.body;
    let authorised_access = ["zonal_manager", "rsm", "asm", "agent", "buyer", "national_head", "special_login"];
    if (authorised_access.includes(user_role)) access_request = true;
    else throw new Error(`You are not authorised!!!`);
    if (!access_request) throw new Error(`You are not authorised!!!`);

    let data = [];
    const { season, matno_seq, matnr, quality, blend, brand, buyer_id } = req.query;
    if (!buyer_id) throw new Error(`Please select a buyer!!!`);
    const responseFromService = await productService.find_material({ season, matno_seq, matnr, quality, blend, brand });

    if (responseFromService.length) {
      // let prev_order = await orderService.findConfirmOrderMapData({ buyer_id, season, material_no: matnr });
      for (let item of responseFromService) {
        let DEL_PERIOD = [12, 1, 2, 3, 4, 5];
        if (parseInt(item.DELIVERY_PERIOD) == 12) DEL_PERIOD = [12, 1, 2, 3, 4, 5];
        if (parseInt(item.DELIVERY_PERIOD) == 1) DEL_PERIOD = [1, 2, 3, 4, 5];
        if (parseInt(item.DELIVERY_PERIOD) == 2) DEL_PERIOD = [2, 3, 4, 5];
        if (parseInt(item.DELIVERY_PERIOD) == 3) DEL_PERIOD = [3, 4, 5];
        if (parseInt(item.DELIVERY_PERIOD) == 4) DEL_PERIOD = [4, 5];
        if (parseInt(item.DELIVERY_PERIOD) == 5) DEL_PERIOD = [5];

        DEL_PERIOD = DEL_PERIOD.filter((e) => {
          return e !== 12;
        });
        let obj = {
          ulc: item.ULC ? item.ULC.split(",") : [],
          img: "https://notionalsystems.in/no-image.jpg",
          // img: item.IMG_URL ? item.IMG_URL : 'https://notionalsystems.in/no-image.jpg',
          unit_price: "6969",
          SEASON: item.SEASON,
          ZYEAR: item.YEAR,
          MATNO_SEQ: item.SEQUENCE_NUMBER_OF_MATERIAL,
          QUALITY: item.QUALITY_NO,
          MATNR: item.MATERIAL,
          SHADE: item.SHADE,
          DEL_PERIOD: DEL_PERIOD,
          XFACT_PRICE: item.EX_FACTORY_PRICE,
          BRAND: item.DESCRIPTION,
          BLEND: item.MATERIAL_GROUP,
          id: item.id,
        };
        data.push(obj);
      }
      function compare(a, b) {
        if (parseInt(a.SHADE) < parseInt(b.SHADE)) return -1;
        if (parseInt(a.SHADE) > parseInt(b.SHADE)) return 1;
        return 0;
      }

      data.sort(compare);

      response.status = 200;
      response.message = constants.productMessage.RESOURCE_FOUND;
      response.count = await productService.find_material({ season, matno_seq, matnr, quality, brand, count: true });
      response.body = { data: data };
      // if(prev_order.length) response.body["prev_orders"] = prev_order;
    } else {
      response.status = 202;
      response.message = constants.productMessage.RESOURCE_NOT_FOUND;
    }
  } catch (error) {
    console.log("Something went wrong: Controller: searchMaterial", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};
