const constants = require("../constants");
const cartService = require("../services/cartService");
const userService = require("../services/userLoginService");
const productService = require("../services/productService");
const orderService = require("../services/orderService");

const fs = require("fs");
const axios = require("axios");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { formatMongoData, checkObjectId } = require("../helpers/dbHelper");
const jwt = require("jsonwebtoken");

module.exports.searchCartItems = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let access_request = false;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
        if (authorised_access.includes(user_role)) access_request = true;
        else throw new Error(`You are not authorised!!!`);
        if (!access_request) throw new Error(`You are not authorised!!!`);

        let total_units = 0.0;
        let total_meters = 0.0;
        let exMillPrice = 0.0;
        let total_value = 0.0;

        const responseFromService = await cartService.find_cart_items({ user_id, skip: req.query.skip, limit: req.query.limit });
        if (responseFromService.length) {
            let buyer = await userService.searchLoginUser({ id: responseFromService[0].buyer_id });
            let agent;
            if (responseFromService[0].agent_id) agent = await userService.searchLoginUser({ id: responseFromService[0].agent_id });
            let buyer_name = buyer.name;
            let agent_agency = agent ? agent.agent_agency : '';
            let area_code = buyer.area_code;

            for (let item of responseFromService) {
                let shadeNo = await productService.find_material({ matnr: item.material_no });
                let ulc_conversion = await orderService.findUlcConversionData({ ulc: item.ulc });

                let DEL_PERIOD = [12, 1, 2, 3, 4, 5];
                if (parseInt(shadeNo[0].DELIVERY_PERIOD) == 12) DEL_PERIOD = [12, 1, 2, 3, 4, 5];
                if (parseInt(shadeNo[0].DELIVERY_PERIOD) == 1) DEL_PERIOD = [1, 2, 3, 4, 5];
                if (parseInt(shadeNo[0].DELIVERY_PERIOD) == 2) DEL_PERIOD = [2, 3, 4, 5];
                if (parseInt(shadeNo[0].DELIVERY_PERIOD) == 3) DEL_PERIOD = [3, 4, 5];
                if (parseInt(shadeNo[0].DELIVERY_PERIOD) == 4) DEL_PERIOD = [4, 5];
                if (parseInt(shadeNo[0].DELIVERY_PERIOD) == 5) DEL_PERIOD = [5];
                DEL_PERIOD = DEL_PERIOD.filter((e) => { return e !== 12 })

                item["ulc_options"] = shadeNo ? shadeNo[0].ULC.split(",") : [];
                item["img"] = shadeNo[0].IMG_URL;
                item["DEL_PERIOD_OPTIONS"] = DEL_PERIOD;
                item["shade"] = shadeNo ? shadeNo[0].SHADE : "";
                item["unit_price"] = shadeNo ? shadeNo[0].UNIT_PRICE : "0";
                item["item_total_units"] = (parseFloat(item.units)).toFixed(2);
                item["item_total_meters"] = (parseFloat(item.units) * parseFloat(ulc_conversion[0].meters)).toFixed(2);
                item["item_exMillPrice"] = (parseFloat(item.ex_mill_price) * parseFloat(item.units)).toFixed(2);
                item["item_total_value"] = (parseFloat(item.units) * parseFloat(item.ex_mill_price) * parseFloat(ulc_conversion[0].meters)).toFixed(2);

                if (ulc_conversion.length) {
                    total_units += parseFloat(item.units);
                    total_meters += parseFloat(item.units) * parseFloat(ulc_conversion[0].meters);
                    exMillPrice += parseFloat(item.ex_mill_price) * parseFloat(item.units);
                    total_value += parseFloat(item.units) * parseFloat(item.ex_mill_price) * parseFloat(ulc_conversion[0].meters);
                }
                delete item.user_id;
                delete item.user_role;
                delete item.createdAt;
                delete item.updatedAt;
                delete item.buyer_id;
                delete item.agent_id;
                delete item.buyer_name;
            }

            response.status = 200;
            response.message = constants.cartMessage.RESOURCE_FOUND;
            response.count = await cartService.find_cart_items({ user_id, count: true });
            response.body = {
                data: responseFromService,
                total_units: total_units.toFixed(2),
                total_meters: total_meters.toFixed(2),
                exMillPrice: exMillPrice.toFixed(2),
                total_value: total_value.toFixed(2),
                buyer_name: buyer_name,
                area_code: area_code,
                agent_agency: agent_agency,
            };
        } else {
            response.status = 202;
            response.message = constants.cartMessage.RESOURCE_NOT_FOUND;
        }
    } catch (error) {
        console.log("Something went wrong: Controller: searchCartItems", error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

module.exports.searchSingleCartItems = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let access_request = false;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
        if (authorised_access.includes(user_role)) access_request = true;
        else throw new Error(`You are not authorised!!!`);
        if (!access_request) throw new Error(`You are not authorised!!!`);

        const responseFromService = await cartService.find_cart_items({
            user_id,
            id: req.params.id,
            skip: req.query.skip,
            limit: req.query.limit,
        });
        if (responseFromService) {
            response.status = 200;
            response.message = constants.cartMessage.RESOURCE_FOUND;
            response.body = { data: responseFromService };
        } else {
            response.status = 202;
            response.message = constants.cartMessage.RESOURCE_NOT_FOUND;
        }
    } catch (error) {
        console.log("Something went wrong: Controller: searchSingleCartItems", error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

module.exports.updateCartItem = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let access_request = false;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
        if (authorised_access.includes(user_role)) access_request = true;
        else throw new Error(`You are not authorised!!!`);
        if (!access_request) throw new Error(`You are not authorised!!!`);

        let info = {
            delivery_period: req.body.delivery_period,
            ulc: req.body.ulc,
            units: req.body.units,
        };
        const responseFromService = await cartService.update_cart_items({ id: req.params.id, updateInfo: info });
        if (responseFromService) {
            response.status = 200;
            response.message = constants.cartMessage.RESOURCE_FOUND;
            response.body = { data: responseFromService };
        } else {
            response.status = 202;
            response.message = constants.cartMessage.RESOURCE_NOT_FOUND;
        }
    } catch (error) {
        console.log("Something went wrong: Controller: updateCartItem", error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

module.exports.deleteCartItem = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let access_request = false;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
        if (authorised_access.includes(user_role)) access_request = true;
        else throw new Error(`You are not authorised!!!`);
        if (!access_request) throw new Error(`You are not authorised!!!`);

        const responseFromService = await cartService.delete_cart_items({ id: req.params.id });
        if (responseFromService) {
            response.status = 200;
            // response.message = constants.cartMessage.RESOURCE_FOUND;
        } else {
            response.status = 202;
            response.message = constants.cartMessage.RESOURCE_NOT_FOUND;
        }
    } catch (error) {
        console.log("Something went wrong: Controller: deleteCartItem", error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

module.exports.clearAllCartItems = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let access_request = false;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
        if (authorised_access.includes(user_role)) access_request = true;
        else throw new Error(`You are not authorised!!!`);
        if (!access_request) throw new Error(`You are not authorised!!!`);

        await cartService.bulkDeleteByUserId({ user_id });

        response.status = 200;
        response.message = constants.cartMessage.CART_CLEAR;
    } catch (error) {
        console.log("Something went wrong: Controller: clearAllCartItems", error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

module.exports.insertToCart = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let responseFromService;
        let user_access = false;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role, email, buyer_id, items, booking_sub_category,agent_id } = req.body;
        let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
        if (authorised_access.includes(user_role)) user_access = true;
        else throw new Error(`You are not authorised!!!`);

        if (!buyer_id) throw new Error(`Please select a buyer!!!`);
        let BUYER = await userService.searchLoginUser({ id: buyer_id });
        if (!BUYER) throw new Error(`Please select a buyer!!!`);

        for (let item of items) {
            const { material_no, delivery_period, ulc, units, shade, season, product_id, category } = item;
            if (units) {
                checkObjectId(product_id);
                let product = await productService.find_material({ id: product_id });
                if (product.length) {
                    let exist = await cartService.find_cart_items({
                        material_no,
                        user_id,
                        delivery_period,
                        ulc,
                        serial_no: product[0].MATNO_SEQ,
                        shade,
                        season,
                        booking_sub_category,
                        buyer_id,
                    });
                    if (exist.length) responseFromService = await cartService.update_cart_items({ id: exist[0].id, updateInfo: { units: units } });
                    else {
                        responseFromService = await cartService.insertCartDetails({
                            user_id,
                            user_role,
                            material_no,
                            delivery_period,
                            ulc,
                            units,
                            serial_no: product[0].SEQUENCE_NUMBER_OF_MATERIAL,
                            shade,
                            season,
                            category,
                            ex_mill_price: product[0].EX_FACTORY_PRICE,
                            product_id,
                            buyer_id,
                            agent_id,
                            booking_sub_category,
                            status: "Active",
                        });
                    }
                }
            }
        }
        if (responseFromService) {
            response.status = 201;
            response.message = constants.cartMessage.PRODUCT_ADD;
            return res.status(response.status).send(response);
        }
        if (!cartItems.length) {
            response.status = 400;
            response.message = constants.cartMessage.TRY_AGAIN;
        }
    } catch (error) {
        console.log("Something went wrong: Controller: insertToCart", error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};
