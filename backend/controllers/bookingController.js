const constants = require('../constants');
const cartService = require('../services/cartService');
const bookingService = require('../services/bookingService');
const userService = require('../services/userLoginService');
const productService = require('../services/productService');
const orderService = require("../services/orderService");
const rppService = require("../services/rppService");
const adminService = require('../services/adminService');

const fs = require('fs');
const axios = require('axios');
const moment = require('moment');
const { formatMongoData, checkObjectId } = require("../helpers/dbHelper");
const jwt = require('jsonwebtoken');


module.exports.seasonsInfo = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let user_access = false;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role, email } = req.body;
        let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
        if (authorised_access.includes(user_role)) user_access = true;
        else throw new Error(`You are not authorised!!!`);

        if (user_access) {
            let season_info = await bookingService.find_season({});
            const responseFromService = season_info.map((item) => {
                let obj = {
                    name: `${item.SEASON}`,
                    collection: item.SEASON,
                    season: item.BEZEI,
                    id: item.id,
                };
                return obj;
            });


            if (responseFromService.length) {
                response.status = 200;
                // response.message = constants.cartMessage.RESOURCE_FOUND;
                response.body = {
                    seasons: responseFromService
                };
            }
        } else {
            response.status = 202;
            // response.message = constants.cartMessage.RESOURCE_NOT_FOUND;
        }
    } catch (error) {
        console.log("Something went wrong: Controller: seasonsInfo", error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

module.exports.seasonsData = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let user_access = false;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role, email } = req.body;
        let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
        if (authorised_access.includes(user_role)) user_access = true;
        else throw new Error(`You are not authorised!!!`);

        if (
            req.query.booking_sub_category &&
            req.query.booking_sub_category.toLowerCase() === "suiting" &&
            req.query.booking_type &&
            req.query.booking_type.toLowerCase() === "seasonal_booking" &&
            user_access
        ) {
            let agents = [];
            let season_info = await bookingService.find_season({});
            const responseFromService = season_info.map((item) => {
                let obj = {
                    name: `${item.SEASON}`,
                    collection: item.SEASON,
                    season: item.BEZEI,
                    id: item.id,
                };
                return obj;
            });

            let search_info = {};
            if (user_role === "national_head") search_info = { nh_email: email };
            if (user_role === "zonal_manager") search_info = { zsm_email: email };
            if (user_role === "rsm") search_info = { rsm_email: email };
            if (user_role === "asm") search_info = { asm_email: email };
            // if (user_role === "agent") search_info = { agent_email: email };
            if (user_role === "special_login") search_info = {};
            if (search_info) {
                search_info['unique_agent'] = true;
                let agent_info = await userService.searchUsersFromUserMapping(search_info);
                let unique = agent_info[0].uniqueCount;
                unique.sort((a, b) => a.localeCompare(b));
                if (agent_info.length && unique.length) {
                    for (let item of unique) {
                        if (item != undefined && item != null) {
                            let agent_infos = await userService.searchUsers({ email: item, user_type: "agent" });
                            if (agent_infos.length) {
                                let obj = {
                                    name: `${agent_infos[0].agent_agency}-${agent_infos[0].agent_county_code}`,
                                    county_code: agent_infos[0].agent_county_code,
                                    email: agent_infos[0].email,
                                    id: agent_infos[0].id,
                                };
                                agents.push(obj);
                            }
                        }
                    }
                }
            }

            let serial_no = await productService.find_material({ unique_matno_seq: true });
            function compare(a, b) {
                if (parseInt(a) < parseInt(b)) return -1;
                if (parseInt(a) > parseInt(b)) return 1;
                return 0;
            }
            serial_no.sort(compare);
            let ulc = await orderService.findUlcConversionData({});
            if (ulc.length) {
                ulc = ulc.map((item) => {
                    let obj = {
                        ulc: parseFloat(item.ulc),
                        meter: parseFloat(item.meters),
                    };
                    return obj;
                });
            }
            if (responseFromService.length && serial_no.length && ulc.length) {
                response.status = 200;
                // response.message = constants.cartMessage.RESOURCE_FOUND;
                response.body = {
                    seasons: responseFromService,
                    agents: agents,
                    serial_no: serial_no,
                    ulc_conversion: ulc,
                };
            }
        } else {
            response.status = 202;
            // response.message = constants.cartMessage.RESOURCE_NOT_FOUND;
        }
    } catch (error) {
        console.log("Something went wrong: Controller: seasonsData", error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

module.exports.buyerData = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let user_access = false;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role, email } = req.body;
        let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
        if (authorised_access.includes(user_role)) user_access = true;
        let buyers = [];

        if (req.query.search_type && !req.query.agent_id && req.query.search_type.toLowerCase() === 'specific_search' && user_access) {
            let search_info = {};
            if (user_role === "national_head") search_info = { nh_email: email };
            if (user_role === "zonal_manager") search_info = { zsm_email: email };
            if (user_role === "rsm") search_info = { rsm_email: email };
            if (user_role === "asm") search_info = { asm_email: email };
            if (user_role === "agent") search_info = { agent_email: email };
            if (req.query.name) search_info['customer_name'] = req.query.name;
            if (req.query.customer_no) search_info['customer_no'] = req.query.customer_no;
            if (user_role === "special_login") search_info = {};
            if (search_info) {
                let buyer_info = await userService.searchUsersFromUserMapping(search_info);
                if (buyer_info.length) {
                    // let distinct_buyer_info = await [...new Set(buyer_info.map(x => x.customer_no))];
                    let distinct_buyer_info = await [...new Set(buyer_info.map(x => {
                        let obj = {
                            name: `${x.buyer_customer_no}-${x.buyer_name}-${x.buyer_city}`,
                            id: x.buyer_id,
                        }
                        return obj;
                    }))];
                    // for (let item of distinct_buyer_info) {
                    //     if (item != undefined && item != null) {
                    //         let buyer_infos = await userService.searchUsers({ email: item, customer_id: item, user_type: "buyer" });
                    //         let obj = {
                    //             name: `${buyer_infos[0].customer_id}-${buyer_infos[0].name}-${buyer_infos[0].city}`,
                    //             id: buyer_infos[0].id,
                    //         };
                    //         buyers.push(obj);
                    //     }
                    // }
                    // buyer_info = buyer_info.split(',');
                    // distinct_buyer_info = distinct_buyer_info.split(",");

                    // buyer_info.filter(async (item) => {
                    //     if (item != undefined && item != null) {
                    //         let obj = {
                    //             name: `${item.buyer_customer_no}-${item.buyer_name}-${item.buyer_city}`,
                    //             id: item.buyer_id,
                    //         };
                    //         buyers.push(obj);
                    //         return true;
                    //     }
                    // });

                    response.status = 200;
                    // response.message = constants.cartMessage.RESOURCE_FOUND;
                    response.body = {
                        buyer: distinct_buyer_info
                    };

                }
            }
        } else if (req.query.agent_id && user_access && !req.query.search_type) {
            let search_info = {};

            let agent_info = await userService.searchUsers({ id: req.query.agent_id, user_type: "agent" });
            if (!agent_info.length) throw new Error('Agent information is wrong!!!');

            if (user_role === "national_head") search_info = { nh_email: email, agent_email: agent_info[0].email };
            if (user_role === "zonal_manager") search_info = { zsm_email: email, agent_email: agent_info[0].email };
            if (user_role === "rsm") search_info = { rsm_email: email, agent_email: agent_info[0].email };
            if (user_role === "asm") search_info = { asm_email: email, agent_email: agent_info[0].email };
            if (user_role === "agent") search_info = { agent_email: email };
            if (req.query.name) search_info['customer_name'] = req.query.name;
            if (req.query.customer_no) search_info['customer_no'] = req.query.customer_no;
            if (user_role === "special_login") search_info = {};

            if (search_info) {
                let buyer_info = await userService.searchUsersFromUserMapping(search_info);
                if (buyer_info.length) {
                    // let distinct_buyer_info = await [...new Set(buyer_info.map(x => x.customer_no))];
                    let distinct_buyer_info = await [...new Set(buyer_info.map(x => {
                        let obj = {
                            name: `${x.buyer_customer_no}-${x.buyer_name}-${x.buyer_city}`,
                            id: x.buyer_id,
                        }
                        return obj;
                    }))];
                    response.status = 200;
                    // response.message = constants.cartMessage.RESOURCE_FOUND;
                    response.body = {
                        buyer: distinct_buyer_info
                    };
                } else {
                    response.status = 202;
                    // response.message = constants.cartMessage.RESOURCE_FOUND;
                    response.body = {
                        buyer: []
                    };
                }
            }
        }
    } catch (error) {
        console.log('Something went wrong: Controller: buyerData', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
}


module.exports.agentList = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let user_access = false;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
        if (authorised_access.includes(user_role)) user_access = true;
        else if (user_role.toLowerCase() === 'admin') user_access = true;
        else throw new Error(`You are not authorised!!!`);
        let agents = [];

        let agent_info = await userService.searchUsers({ agent_id: req.params.agent_id, asm_id: user_id });
        if (agent_info.length && user_access) {
            agent_info.filter(item => {
                if (item.user_type && item.user_type.toLowerCase() === 'agent') {
                    let obj = {
                        name: item.agent_agency,
                        id: item.id
                    }
                    agents.push(obj);
                    return true;
                }
            });
        }
        if (agents.length && user_access) {
            response.status = 200;
            // response.message = constants.cartMessage.RESOURCE_FOUND;
            response.body = {
                agents: agents,
            };
        }
    } catch (error) {
        console.log('Something went wrong: Controller: agentList', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

module.exports.familyTree = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let user_access = false;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role, email } = req.body;
        let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
        if (authorised_access.includes(user_role)) user_access = true;
        else throw new Error(`You are not authorised!!!`);

        const { asm, rsm, zonal, agent, skip, limit } = req.query;
        let ASM;
        let RSM;
        let ZSM;
        let AGENT;
        if (asm) ASM = await userService.searchUsers({ id: asm, user_type: 'asm' });
        if (rsm) RSM = await userService.searchUsers({ id: rsm, user_type: 'rsm' });
        if (zonal) ZSM = await userService.searchUsers({ id: zonal, user_type: 'zonal_manager' });
        if (agent) AGENT = await userService.searchUsers({ id: agent, user_type: 'agent' });

        let buyer = [];
        let search_info = {};
        let buyer_infos = [];
        if (skip) search_info["skip"] = skip;
        if (limit) search_info["limit"] = limit;
        if (user_role === "national_head") {
            search_info["nh_email"] = email;
            search_info["buyer_data"] = true;
            if (zonal && ZSM.length) search_info["zsm_email"] = ZSM[0].email;
            if (rsm && RSM.length) search_info["rsm_email"] = RSM[0].email;
            if (rsm && RSM.length) search_info["rsm_email"] = RSM[0].email;
            if (asm && ASM.length) search_info["asm_email"] = ASM[0].email;
            if (agent && AGENT.length) search_info["agent_email"] = AGENT[0].email;
            buyer_infos = await userService.searchUsersFromUserMapping(search_info);
        }
        if (user_role === "zonal_manager") {
            search_info["zsm_email"] = email;
            search_info["buyer_data"] = true;
            if (rsm && RSM.length) search_info["rsm_email"] = RSM[0].email;
            if (asm && ASM.length) search_info["asm_email"] = ASM[0].email;
            if (agent && AGENT.length) search_info["agent_email"] = AGENT[0].email;
            buyer_infos = await userService.searchUsersFromUserMapping(search_info);
        }
        if (user_role === "rsm") {
            search_info["rsm_email"] = email;
            search_info["buyer_data"] = true;
            if (asm && ASM.length) search_info["asm_email"] = ASM[0].email;
            if (agent && AGENT.length) search_info["agent_email"] = AGENT[0].email;
            buyer_infos = await userService.searchUsersFromUserMapping(search_info);
        }
        if (user_role === "asm") {
            search_info["asm_email"] = email;
            search_info["buyer_data"] = true;
            if (agent && AGENT.length) search_info["agent_email"] = AGENT[0].email;
            buyer_infos = await userService.searchUsersFromUserMapping(search_info);
        }
        if (user_role === "agent") {
            search_info["agent_email"] = email;
            search_info["buyer_data"] = true;
            buyer_infos = await userService.searchUsersFromUserMapping(search_info);
        }
        // let buyer_infos = await userService.searchUsers(search_info);
        if (buyer_infos.length) {
            for (let buyer_info of buyer_infos) {
                let total_value = 0.0;
                let total_units = 0.0;
                let total_meters = 0.0;
                let total_ex_mill = 0.0;
                let roll_ups_earn = 0.0;
                let roll_ups_balance = 0.0;
                let roll_ups_bonus = 0.0;
                let roll_ups_pending = 0.0;
                let roll_ups_tier = "";

                let rollUps = await rppService.findBuyerPointRollUps({ buyer_id: buyer_info.buyer_id._id });
                if (rollUps) {
                    roll_ups_earn = parseFloat(rollUps.earn_points);
                    roll_ups_balance = parseFloat(rollUps.balance_points);
                    roll_ups_bonus = parseFloat(rollUps.bonus_points);
                    roll_ups_pending = parseFloat(rollUps.pending_points);
                    roll_ups_tier = rollUps.final_tier ? rollUps.final_tier : "";
                }

                let orders = await orderService.findOrders({ buyer_id: buyer_info.buyer_id._id });
                if (orders.length) {
                    for (let item of orders) {
                        total_value += parseFloat(item.total_value);
                        total_units += parseFloat(item.total_units);
                        total_meters += parseFloat(item.total_meters);
                        total_ex_mill += parseFloat(item.exMillPrice);
                    }
                }
                let obj = {
                    name: buyer_info.buyer_id.name,
                    id: buyer_info.buyer_id._id,
                    customer_id: buyer_info.buyer_id ? buyer_info.buyer_id.customer_id : "xxx-xxx-xxx",
                    mobile: buyer_info.buyer_id.mobile,
                    email: buyer_info.buyer_id.email,
                    address: buyer_info.buyer_id ? buyer_info.buyer_id.city : "kolkata",
                    total_value: total_value,
                    total_units: total_units,
                    total_meters: total_meters,
                    total_ex_mill: total_ex_mill,
                    roll_ups_earn: roll_ups_earn,
                    roll_ups_balance: roll_ups_balance,
                    roll_ups_bonus: roll_ups_bonus,
                    roll_ups_pending: roll_ups_pending,
                    roll_ups_tier: roll_ups_tier === "1" ? "Silver" : roll_ups_tier === "2" ? "Gold" : roll_ups_tier === "3" ? "Platinum" : "",
                };
                buyer.push(obj);
            }
            function compare(a, b) {
                if (a.roll_ups_balance < b.roll_ups_balance) return -1;
                if (a.roll_ups_balance > b.roll_ups_balance) return 1;
                return 0;
            }
            buyer.sort(compare);
            buyer.reverse();

            response.status = 200;
            // response.message = constants.cartMessage.RESOURCE_FOUND;
            response.body = {
                buyer: buyer,
            };
        } else {
            response.status = 202;
            // response.message = constants.cartMessage.RESOURCE_FOUND;
            response.body = {
                buyer: [],
            };
        }
    } catch (error) {
        console.log("Something went wrong: Controller: familyTree", error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};


module.exports.familyTreeHierarchy = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let data = [];
        let user_access = false;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role, email } = req.body;
        let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
        if (authorised_access.includes(user_role)) user_access = true;
        else throw new Error(`You are not authorised!!!`);

        if (req.params.id) {
            checkObjectId(req.params.id);
            let USER = await userService.searchLoginUser({ id: req.params.id });

            if (req.query.user_type === 'national_head' && USER) {
                let query = { nh_email: USER.email, unique_zsm: true }
                let info = await userService.searchUsersFromUserMapping(query);
                if (info.length) {
                    let zonal = [];
                    let infos = info[0].uniqueCount;
                    // let distinct_zonal_info = await [...new Set(info.map((x) => x.zsm_email))];
                    for (let item of infos) {
                        if (item != undefined && item != null && item !== USER.email) {
                            let zonal_infos = await userService.searchUsers({ email: item, user_type: "zonal_manager" });
                            if (zonal_infos.length) {
                                let obj = {
                                    name: zonal_infos[0].name,
                                    id: zonal_infos[0].id,
                                };
                                zonal.push(obj);
                            }
                        }
                    }

                    response.status = 200;
                    response.body = { users: zonal };
                    return res.status(response.status).send(response);
                }
            }
            if (req.query.user_type === 'zonal_manager' && USER) {
                let search_info = { zsm_email: USER.email, unique_rsm: true }; 
                let info = await userService.searchUsersFromUserMapping(search_info);
                if (info.length) {
                    let infos = info[0].uniqueCount;
                    let data = [];
                    // let distinct_rsm_info = await [...new Set(info.map((x) => x.rsm_email))];                    
                    for (let item of infos) {
                        if (item != undefined && item != null && item !== USER.email) {
                            let rsm_infos = await userService.searchUsers({ email: item, user_type: "rsm" });
                            if (rsm_infos.length) {
                                let obj = {
                                    name: rsm_infos[0].name,
                                    id: rsm_infos[0].id,
                                };
                                data.push(obj);
                            }
                        }
                    }
                    response.status = 200;
                    response.body = { users: data };
                    return res.status(response.status).send(response);
                }
            }
            if (req.query.user_type === 'rsm' && USER) {
                let search_info = { rsm_email: USER.email, unique_asm : true };
                let info = await userService.searchUsersFromUserMapping(search_info);
                if (info.length) {
                    let data = [];
                    let infos = info[0].uniqueCount;
                    // let distinct_asm_info = await [...new Set(info.map((x) => x.asm_email))];
                    for (let item of infos) {
                        if (item != undefined && item != null && item !== USER.email) {
                            let asm_infos = await userService.searchUsers({ email: item, user_type: "asm" });
                            if (asm_infos.length) {
                                let obj = {
                                    name: asm_infos[0].name,
                                    id: asm_infos[0].id,
                                };
                                data.push(obj);
                            }
                        }
                    }

                    response.status = 200;
                    response.body = { users: data };
                    return res.status(response.status).send(response);
                }
            }
            if (req.query.user_type === 'asm' && USER) {
                let search_info = { asm_email: USER.email, unique_agent: true };
                let info = await userService.searchUsersFromUserMapping(search_info);
                if (info.length) {
                    let data = [];
                    let infos = info[0].uniqueCount;
                    // let distinct_agent_info = await [...new Set(info.map((x) => x.agent_email))];
                    for (let item of infos) {
                        if (item != undefined && item != null && item !== USER.email) {
                            let agent_infos = await userService.searchUsers({ email: item, user_type: "agent" });
                            if (agent_infos.length) {
                                let obj = {
                                    name: agent_infos[0].name,
                                    id: agent_infos[0].id,
                                };
                                data.push(obj);
                            }
                        }
                    }

                    response.status = 200;
                    response.body = { users: data };
                    return res.status(response.status).send(response);
                }
            }
            if (req.query.user_type === 'agent' && USER) {
                let search_info = { unique_buyer: true, agent_email: USER.email };
                let info = await userService.searchUsersFromUserMapping(search_info);
                if (info.length) {
                    let data = [];
                    let infos = info[0].uniqueCount;
                    // let distinct_buyer_info = await [...new Set(info.map((x) => x.customer_no))];
                    for (let item of infos) {
                        if (item != undefined && item != null && item !== USER.email) {
                            let buyer_infos = await userService.searchUsers({ email: item, user_type: "buyer" });
                            if (buyer_infos.length) {
                                let obj = {
                                    name: `${buyer_infos[0].customer_id}-${buyer_infos[0].name}-${buyer_infos[0].city}`,
                                    id: buyer_infos[0].id,
                                };
                                data.push(obj);
                            }
                        }
                    }

                    response.status = 200;
                    response.body = { users: data };
                    return res.status(response.status).send(response);
                }
            }
        }
        else {
            response.status = 403;
        }
    } catch (error) {
        console.log('Something went wrong: Controller: familyTreeHierarchy', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
}

module.exports.fetchImageForBanner = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
        if (authorised_access.includes(user_role)) user_access = true;
        else {
            user_access = false;
            throw new Error(`You are not authorised!!!`)
        }

        if (!user_access) throw new Error(`You are not authorised!!!`);

        let final_offer1;
        let offer1;
        let upcoming_booking1;
        let banner1;
        let search = {};

        let final_offer = await adminService.find_images({ type: 'final_offer' });
        let offer = await adminService.find_images({ type: 'offer' });
        let upcoming_booking = await adminService.find_images({ type: 'upcoming_booking' });
        let banner = await adminService.find_images({ type: 'banner' });


        final_offer1 = final_offer.map(item => {
            let obj = {
                img: `${process.env.MEDIA_PATH + "media/"}${item.img}`,
                // type: item.type,
                // id: item.id
            }
            return obj;
        });
        offer1 = offer.map(item => {
            let obj = {
                img: `${process.env.MEDIA_PATH + "media/"}${item.img}`,
                // type: item.type,
                // id: item.id
            }
            return obj;
        });
        upcoming_booking1 = upcoming_booking.map(item => {
            let obj = {
                img: `${process.env.MEDIA_PATH + "media/"}${item.img}`,
                // type: item.type,
                // id: item.id
            }
            return obj;
        });
        banner1 = banner.map(item => {
            let obj = {
                img: `${process.env.MEDIA_PATH + "media/"}${item.img}`,
                // type: item.type,
                // id: item.id
            }
            return obj;
        });
        if (banner.length) {
            response.status = 200;
            response.body = {
                final_offer: final_offer1,
                offer: offer1,
                upcoming_booking: upcoming_booking1,
                banner: banner1,
            };
        } else {
            response.message = constants.BANNER_IMAGE.TRY_AGAIN;
        }
    } catch (error) {
        console.log("Something went wrong: Controller: fetchImageForBanner", error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};