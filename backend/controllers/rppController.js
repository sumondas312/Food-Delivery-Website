const constants = require("../constants");
const orderService = require("../services/orderService");
const rppService = require("../services/rppService");
const userService = require("../services/userLoginService");
const cartService = require('../services/cartService');
const productService = require("../services/productService");
const jwt = require("jsonwebtoken");

const fs = require("fs");
const axios = require("axios");
const moment = require("moment");
const { formatMongoData, checkObjectId } = require("../helpers/dbHelper");

module.exports.pointCalculationAfterOrder = async ({ order_id }) => {
    try {
        let items = [];
        let total_units = 0.0;
        let total_meters = 0.0;
        let total_value = 0.0;
        let total_ex_mill_price = 0.0;
        let incomming_point = 0.0;

        let order_info = await orderService.findOrders({ order_id: order_id });

        total_units = parseFloat(order_info[0].total_units);
        total_meters = parseFloat(order_info[0].total_meters);
        total_value = parseFloat(order_info[0].total_value);
        total_ex_mill_price = parseFloat(order_info[0].exMillPrice);


        let buyer_data = await userService.searchLoginUser({ id: order_info[0].buyer_id });
        if (buyer_data) {
            let ex_mill_data = await rppService.findExMillRange({
                start_value: total_ex_mill_price,
                end_value: total_ex_mill_price,
                format_type: buyer_data.format_type
            });
            console.log(ex_mill_data, "ex_mill_data");
            if (ex_mill_data) {
                let buyer_final_tier = '1';
                let group_final_tier = '1';
                incomming_point = (parseFloat(ex_mill_data.points_per_meter) * total_meters).toFixed(2);
                let new_bal_point = 0;
                let buyer_roll_ups_data = await rppService.findBuyerPointRollUps({ buyer_id: buyer_data.id, customer_id: buyer_data.customer_id });
                if (buyer_roll_ups_data) {
                    new_bal_point = (parseFloat(buyer_roll_ups_data.balance_points) + parseFloat(incomming_point));
                    buyer_final_tier = buyer_roll_ups_data.final_tier;
                } else new_bal_point = parseFloat(incomming_point);

                // search reward;
                let applicable_reward = await rppService.findRewards({
                    start_value: new_bal_point,
                    end_value: new_bal_point,
                    format_type: buyer_data.format_type
                });
                console.log(applicable_reward, "applicable_reward");

                if (!buyer_roll_ups_data) {
                    //insert 
                    let point_data_rollUps = {
                        buyer_id: buyer_data.id,
                        customer_id: buyer_data.customer_id,
                        earn_points: incomming_point,
                        balance_points: incomming_point,
                        bonus_points: 0,
                        final_tier: buyer_final_tier ? applicable_reward.tier_info : '1',
                        format_type: buyer_data.format_type,
                        rewards_info_id: applicable_reward ? applicable_reward.id : '',
                        // tier_upgrade_date: new Date(),
                        pending_points: 0,
                        delete_point_rollups_flg: 'N'
                        // total_achivement: '0',
                    }
                    await rppService.insertBuyerPointRollUps(point_data_rollUps);
                    buyer_final_tier = buyer_final_tier ? applicable_reward.tier_info : '1';
                } else {
                    //update
                    let info = {
                        earn_points: (parseFloat(buyer_roll_ups_data.earn_points) + parseFloat(incomming_point)).toFixed(2),
                        balance_points: (parseFloat(buyer_roll_ups_data.balance_points) + parseFloat(incomming_point)).toFixed(2),
                        rewards_info_id: applicable_reward ? applicable_reward.id : '',
                        final_tier: applicable_reward ? applicable_reward.tier_info : ''
                    }
                    await rppService.updateBuyerPointRollUps({ id: buyer_roll_ups_data.id, updateInfo: info })
                }

                let point_for_purchase = {
                    buyer_id: buyer_data.id,
                    customer_id: buyer_data.customer_id,
                    point: incomming_point,
                    applied_tier: buyer_final_tier,
                    point_type: '3',// default earn point
                    point_issue_date: new Date(),
                    point_expiry_date: moment(new Date()).add(1, 'Y').format("YYYY-MM-DD HH:mm:ss"),
                    point_expired_flg: 'N',
                    // remarks: remarks,
                    delete_point_flg: 'N',
                    order_id: order_id,
                }
                await rppService.insertBuyerPoint(point_for_purchase);

                // GROUP CALCULATION

                let new_bal_point_group = 0;
                let buyer_group_roll_ups_data = await rppService.findBuyerGroupPointRollUps({ group_id: buyer_data.group_id })
                if (buyer_group_roll_ups_data) {
                    new_bal_point_group = (parseFloat(buyer_group_roll_ups_data.balance_points) + parseFloat(incomming_point));
                    group_final_tier = buyer_group_roll_ups_data.final_tier;
                } else new_bal_point_group = parseFloat(incomming_point);

                // search reward;
                let group_applicable_reward = await rppService.findRewards({
                    start_value: new_bal_point_group,
                    end_value: new_bal_point_group,
                    format_type: buyer_data.format_type
                });
                console.log(group_applicable_reward, "group_applicable_reward", new_bal_point_group);

                if (buyer_group_roll_ups_data) {
                    //update
                    let info = {
                        earn_points: (parseFloat(buyer_group_roll_ups_data.earn_points) + parseFloat(incomming_point)).toFixed(2),
                        balance_points: (parseFloat(buyer_group_roll_ups_data.balance_points) + parseFloat(incomming_point)).toFixed(2),
                        rewards_info_id: group_applicable_reward ? group_applicable_reward.id : '',
                        final_tier: group_applicable_reward ? group_applicable_reward.tier_info : ''
                    }
                    await rppService.updateBuyerGroupPointRollUps({ id: buyer_group_roll_ups_data.id, updateInfo: info })
                } else {
                    //insert
                    let point_data_rollUps = {
                        group_id: buyer_data.group_id,
                        group_code: buyer_data.group_code,
                        earn_points: incomming_point,
                        balance_points: incomming_point,
                        bonus_points: 0,
                        final_tier: group_applicable_reward ? group_applicable_reward.tier_info : '1',
                        tier_info: "1",
                        format_type: buyer_data.format_type,
                        rewards_info_id: group_applicable_reward ? group_applicable_reward.id : '',
                        tier_upgrade_date: new Date(),
                        pending_points: 0,
                        // total_achivement: 0,
                        delete_group_rollups_flg: "N",
                    };
                    await rppService.insertBuyerGroupPointRollUps(point_data_rollUps);
                }
            }
        }
    } catch (error) {
        console.log('Something went wrong: Service: pointCalculationAfterOrder', error);
        return error;
    }
};

// module.exports.pointCalculationAfterOrder = async ({ order_id }) => {
//     try {
//         let items = [];
//         let total_units = 0.0;
//         let total_meters = 0.0;
//         let total_value = 0.0;
//         let total_ex_mill_price = 0.0;
//         let incomming_point = 0.0;

//         let order_info = await orderService.findOrders({ order_id: order_id });

//         total_units = parseFloat(order_info[0].total_units);
//         total_meters = parseFloat(order_info[0].total_meters);
//         total_value = parseFloat(order_info[0].total_value);
//         total_ex_mill_price = parseFloat(order_info[0].exMillPrice);

//         // let orderLineItems = await orderService.findLineItem({ order_id: order_info[0].order_id });
//         // for (let item of orderLineItems) {
//         //     delete item.order_id;
//         //     delete item.createdAt;
//         //     delete item.updatedAt;
//         //     items.push(item);
//         // }

//         let buyer_data = await userService.searchLoginUser({ id: order_info[0].buyer_id });
//         if (buyer_data) {
//             let ex_mill_data = await rppService.findExMillRange({
//                 start_value: total_ex_mill_price,
//                 end_value: total_ex_mill_price,
//                 format_type: buyer_data.format_type
//             });
//             console.log(ex_mill_data, "ex_mill_data");
//             if (ex_mill_data) {
//                 let buyer_final_tier = '1';
//                 let group_final_tier = '1';
//                 incomming_point = (parseFloat(ex_mill_data.points_per_meter) * total_meters).toFixed(2);
//                 let new_bal_point = 0;
//                 let buyer_roll_ups_data = await rppService.findBuyerPointRollUps({ buyer_id: buyer_data.id, customer_id: buyer_data.customer_id });
//                 if (buyer_roll_ups_data) {
//                     new_bal_point = (parseFloat(buyer_roll_ups_data.balance_points) + parseFloat(incomming_point));
//                     buyer_final_tier = buyer_roll_ups_data.final_tier;
//                 } else new_bal_point = parseFloat(incomming_point);

//                 // search reward;
//                 let applicable_reward = await rppService.findRewards({
//                     start_value: new_bal_point,
//                     end_value: new_bal_point,
//                     format_type: buyer_data.format_type
//                 });
//                 console.log(applicable_reward, "applicable_reward");

//                 if (!buyer_roll_ups_data) {
//                     //insert 
//                     let point_data_rollUps = {
//                         buyer_id: buyer_data.id,
//                         customer_id: buyer_data.customer_id,
//                         earn_points: incomming_point,
//                         balance_points: incomming_point,
//                         bonus_points: 0,
//                         final_tier: buyer_final_tier ? applicable_reward.tier_info : '1',
//                         format_type: buyer_data.format_type,
//                         rewards_info_id: applicable_reward ? applicable_reward.id : '',
//                         // tier_upgrade_date: new Date(),
//                         pending_points: 0,
//                         delete_point_rollups_flg: 'N'
//                         // total_achivement: '0',
//                     }
//                     await rppService.insertBuyerPointRollUps(point_data_rollUps);
//                     buyer_final_tier = buyer_final_tier ? applicable_reward.tier_info : '1';
//                 } else {
//                     //update
//                     let info = {
//                         earn_points: (parseFloat(buyer_roll_ups_data.earn_points) + parseFloat(incomming_point)).toFixed(2),
//                         balance_points: (parseFloat(buyer_roll_ups_data.balance_points) + parseFloat(incomming_point)).toFixed(2),
//                         rewards_info_id: applicable_reward ? applicable_reward.id : '',
//                         final_tier: applicable_reward ? applicable_reward.tier_info : ''
//                     }
//                     await rppService.updateBuyerPointRollUps({ id: buyer_roll_ups_data.id, updateInfo: info })
//                 }

//                 let point_for_purchase = {
//                     buyer_id: buyer_data.id,
//                     customer_id: buyer_data.customer_id,
//                     point: incomming_point,
//                     applied_tier: buyer_final_tier,
//                     point_type: '3',// default earn point
//                     point_issue_date: new Date(),
//                     point_expiry_date: moment(new Date()).add(1, 'Y').format("YYYY-MM-DD HH:mm:ss"),
//                     point_expired_flg: 'N',
//                     // remarks: remarks,
//                     delete_point_flg: 'N',
//                     order_id: order_id,
//                 }
//                 await rppService.insertBuyerPoint(point_for_purchase);

//                 // GROUP CALCULATION

//                 let new_bal_point_group = 0;
//                 let buyer_group_roll_ups_data = await rppService.findBuyerGroupPointRollUps({ group_id: buyer_data.group_id })
//                 if (buyer_group_roll_ups_data) {
//                     new_bal_point_group = (parseFloat(buyer_group_roll_ups_data.balance_points) + parseFloat(incomming_point));
//                     group_final_tier = buyer_group_roll_ups_data.final_tier;
//                 } else new_bal_point_group = parseFloat(incomming_point);

//                 // search reward;
//                 let group_applicable_reward = await rppService.findRewards({
//                     start_value: new_bal_point_group,
//                     end_value: new_bal_point_group,
//                     format_type: buyer_data.format_type
//                 });
//                 console.log(group_applicable_reward, "group_applicable_reward",new_bal_point_group);

//                 if (buyer_group_roll_ups_data) {
//                     //update
//                     let info = {
//                         earn_points: (parseFloat(buyer_group_roll_ups_data.earn_points) + parseFloat(incomming_point)).toFixed(2),
//                         balance_points: (parseFloat(buyer_group_roll_ups_data.balance_points) + parseFloat(incomming_point)).toFixed(2),
//                         rewards_info_id: group_applicable_reward ? group_applicable_reward.id : '',
//                         final_tier: group_applicable_reward ? group_applicable_reward.tier_info : ''
//                     }
//                     await rppService.updateBuyerGroupPointRollUps({ id: buyer_group_roll_ups_data.id, updateInfo: info })
//                 } else {
//                     //insert
//                     let point_data_rollUps = {
//                         group_id: buyer_data.group_id,
//                         group_code: buyer_data.group_code,
//                         earn_points: incomming_point,
//                         balance_points: incomming_point,
//                         bonus_points: 0,
//                         final_tier: group_applicable_reward ? group_applicable_reward.tier_info : '1',
//                         tier_info: "1",
//                         format_type: buyer_data.format_type,
//                         rewards_info_id: group_applicable_reward ? group_applicable_reward.id : '',
//                         tier_upgrade_date: new Date(),
//                         pending_points: 0,
//                         // total_achivement: 0,
//                         delete_group_rollups_flg: "N",
//                     };
//                     await rppService.insertBuyerGroupPointRollUps(point_data_rollUps);
//                 }
//             }
//         }
//     } catch (error) {
//         console.log('Something went wrong: Service: pointCalculationAfterOrder', error);
//         return error;
//     }
// };

module.exports.loyalityAndReward = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        // let arr = ['asm', 'zonal_manager', 'agent']
        const token = req.headers.authorization.split('Bearer')[1].trim();
        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'buyraymond-secret-key');
        let userData = await userService.searchLoginUser({ id: decoded.id });
        if (!userData) throw new Error(`You are not authorised!!!`);
        
        let user_id = decoded.id;
        let user_role = decoded.user_type;

        let buyer_point_info = []
        // if (arr.includes(user_role.toLowerCase())) {
        if (user_role.toLowerCase() === 'asm') {
            let buyer = []

            let agent_info = await userService.searchLoginUser({ id: req.params.agent_id });
            let buyer_info = await userService.searchUsers({ agent_id: req.params.agent_id, asm_id: user_id });
            for (let item of buyer_info) {
                let point_data = await rppService.findBuyerPoint({ buyer_id: item.id });
                for (let box of point_data) {
                    let buyer_info = await userService.searchUsers({ id: box.buyer_id });
                    if (buyer_info.length) {
                        buyer = buyer_info.map(item => {
                            let obj = {
                                name: item.name,
                                id: item.id
                            }
                            box['name'] = item.name;
                            buyer_point_info.push(box);
                            return obj;
                        });
                    }
                }
            }

            let rewardddd;
            const group = await rppService.findBuyerGroup({ id: agent_info.group_id });
            let grp_roll = await rppService.findBuyerGroupPointRollUps({ group_id: group.id });
            if (grp_roll) {
                rewardddd = await rppService.findRewards({ id: grp_roll.rewards_info_id });
            }

            function compare(a, b) {
                if (a.roll_ups_balance < b.roll_ups_balance) return -1;
                if (a.roll_ups_balance > b.roll_ups_balance) return 1;
                return 0;
            }
            buyer_point_info.sort(compare);
            buyer_point_info.reverse();

            if (buyer_point_info.length) {

                response.status = 200;
                response.message = constants.cartMessage.RESOURCE_FOUND;
                response.body = {
                    buyer_points: buyer_point_info,
                    group_info: grp_roll ? grp_roll : '',
                    reward: rewardddd
                };
            } else {
                response.status = 202;
                response.message = constants.cartMessage.RESOURCE_NOT_FOUND;
            }
        }

        // } else {
        //     response.status = 202;
        //     response.message = constants.cartMessage.RESOURCE_NOT_FOUND;
        // }
    } catch (error) {
        console.log('Something went wrong: Controller: loyalityAndReward', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

module.exports.masterReset = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        await rppService.masterReset();

        response.status = 202;
        response.message = `All data erased. Start fresh...`;
    } catch (error) {
        console.log('Something went wrong: Controller: masterReset', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
}
module.exports.masterResetAllX = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        await rppService.masterResetAll();

        response.status = 202;
        response.message = `All data erased. Start fresh...`;
    } catch (error) {
        console.log('Something went wrong: Controller: masterResetAllX', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
}