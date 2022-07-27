const MainFile = require("../database/models/mainFileModel");
const UserMaster = require("../database/models/userMasterModel");
const Product = require("../database/models/productModel");
const { formatMongoData, checkObjectId } = require("../helpers/dbHelper");
const Cart = require("../database/models/cartModel");
const LineItem = require("../database/models/lineItemModel");
const Order = require("../database/models/orderModel");
const UlcConversion = require("../database/models/ulcMasterModel");

const BuyerGroup = require("../database/models/buyerGroupModel");
const BuyerGroupRollUps = require("../database/models/buyerGroupPointRollUpsModel");
const BuyerPoint = require("../database/models/buyerPointModel");
const BuyerRollUps = require("../database/models/buyerPointRollUpsModel");
const FormatType = require("../database/models/formatTypeModel");
const ExMillRange = require("../database/models/exMillRangeModel");
const Rewards = require("../database/models/rewardsModel");
const Tier = require("../database/models/tiersModel");
const UserMapping = require("../database/models/userMappingModel");
const ZsdCustomer = require('../database/models/zsdCustomerDetailsModel');
const ZmlDesignation = require('../database/models/zmlDesignationModel');
const TempLineItem = require("../database/models/tempLineItem.model");
const TempOrder = require("../database/models/tempOrder.model");


module.exports.insertBuyerPoint = async (serviceData) => {
    try {
        let info = new BuyerPoint({ ...serviceData });
        let result = await info.save();

        return formatMongoData(result);
    } catch (error) {
        console.log('Something went wrong: Service: insertBuyerPoint', error);
        throw new Error(error);
    }
};

module.exports.uniqueCodeGenerator = async () => {
    try {
        function randomString(length, chars) {
            var result = "";
            for (var i = length; i > 0; --i)
                result += chars[Math.round(Math.random() * (chars.length - 1))];
            return result;
        }
        let existCheck = async ({ orderId }) => {
            let exist = await LineItem.findOne({
                order_id: orderId,
            });
            if (exist) {
                console.log("**************NEW VOUCHER CODE GENERATED ***********************");
                key = randomString(14, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
                return await existCheck({ orderId: key });
            } else {
                return orderId;
            }
        };
        let key = randomString(14, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        return orderId = await existCheck({ orderId: key });
    } catch (error) {
        console.log('Something went wrong: Service: uniqueCodeGenerator', error);
        throw new Error(error);
    }
};

module.exports.findExMillRange = async ({
    start_value = '',
    end_value = '',
    format_type = '',
}) => {
    try {
        let match = [{ delete_ex_mill_flg: 'N' }];
        if (format_type) match.push({ format_type: format_type });

        if (start_value != '' && end_value != '') {
            // match['start_value'] = { $lte: parseFloat(start_value) }
            // match['end_value'] = { $gte: parseFloat(end_value) }
            match.push({ start_value: { $lte: parseFloat(start_value) } })
            match.push({ end_value: { $gte: parseFloat(end_value) } })
        }
        if (match.length > 1) {
            find = {
                $and: match,
            };
        } else if (match.length == 1) {
            find = match[0];
        }
        // console.log(find);
        let result = await ExMillRange.findOne(find).sort({ _id: -1 });
        if (result) return formatMongoData(result);
        else return false;
    } catch (error) {
        console.log('Something went wrong: Service: findExMillRange', error);
        throw new Error(error);
    }
};

module.exports.findRewards = async ({
    start_value = '',
    end_value = '',
    format_type = '',
    id = '',
}) => {
    try {
        // let match = { delete_rewards_flg: 'N' };
        // if (format_type) match['format_type'] = format_type;
        // if (id) match['_id'] = id;

        // if (start_value != '' && end_value != '') {
        //     match['start_value'] = { $lte: parseFloat(start_value) }
        //     match['end_value'] = { $gte: parseFloat(end_value) }
        // }

        let match = [{ delete_rewards_flg: 'N' }];
        if (format_type) match.push({ format_type: format_type });
        if (id) match.push({ _id: id });

        if (start_value != '' && end_value != '') {
            match.push({ start_value: { $lte: parseFloat(start_value) } })
            match.push({ end_value: { $gte: parseFloat(end_value) } })
        }
        if (match.length > 1) {
            find = {
                $and: match,
            };
        } else if (match.length == 1) {
            find = match[0];
        }

        let result = await Rewards.findOne(find).sort({ start_value: -1 });
        if (result) return formatMongoData(result);
        else return false
    } catch (error) {
        console.log('Something went wrong: Service: findRewards', error);
        throw new Error(error);
    }
};

module.exports.findBuyerPointRollUps = async ({
    customer_id = '',
    buyer_id = '',
    format_type = '',
}) => {
    try {
        let match = { delete_point_rollups_flg: 'N' };

        if (format_type) match['format_type'] = format_type;
        if (customer_id) match['customer_id'] = customer_id;
        if (buyer_id) match['buyer_id'] = buyer_id;


        let result = await BuyerRollUps.findOne(match).sort({ _id: -1 });
        if (result) return formatMongoData(result);
        else return false;
    } catch (error) {
        console.log('Something went wrong: Service: findBuyerPointRollUps', error);
        throw new Error(error);
    }
};

module.exports.insertBuyerPointRollUps = async (serviceData) => {
    try {
        let info = new BuyerRollUps({ ...serviceData });
        let result = await info.save();

        return formatMongoData(result);
    } catch (error) {
        console.log('Something went wrong: Service: insertBuyerPointRollUps', error);
        throw new Error(error);
    }
};

module.exports.updateBuyerPointRollUps = async ({ id, updateInfo }) => {
    try {

        const data = await BuyerRollUps.findByIdAndUpdate({
            _id: id
        }, updateInfo, {
            new: true,
            useFindAndModify: false,
        });

        return formatMongoData(data);
    } catch (error) {
        console.log('Something went wrong: Service: updateBuyerPointRollUps', error);
        throw new Error(error);
    }
};

module.exports.insertBuyerGroupPointRollUps = async (serviceData) => {
    try {
        let info = new BuyerGroupRollUps({ ...serviceData });
        let result = await info.save();

        return formatMongoData(result);
    } catch (error) {
        console.log('Something went wrong: Service: insertBuyerGroupPointRollUps', error);
        throw new Error(error);
    }
};

module.exports.updateBuyerGroupPointRollUps = async ({ id, updateInfo }) => {
    try {

        const data = await BuyerGroupRollUps.findByIdAndUpdate({
            _id: id
        }, updateInfo, {
            new: true,
            useFindAndModify: false,
        });

        return formatMongoData(data);
    } catch (error) {
        console.log('Something went wrong: Service: updateBuyerGroupPointRollUps', error);
        throw new Error(error);
    }
};

module.exports.insertBuyerGroup = async (serviceData) => {
    try {
        let info = new BuyerGroup({ ...serviceData });
        let result = await info.save();

        return formatMongoData(result);
    } catch (error) {
        console.log('Something went wrong: Service: insertBuyerGroup', error);
        throw new Error(error);
    }
};

module.exports.findBuyerGroupPointRollUps = async ({ group_id = "", format_type = "" }) => {
    try {
        let match = { delete_group_rollups_flg: "N" };

        if (format_type) match["format_type"] = format_type;
        if (group_id) match["group_id"] = group_id;

        let result = await BuyerGroupRollUps.findOne(match).sort({ _id: -1 });
        if (result) return formatMongoData(result);
        else return false;
    } catch (error) {
        console.log("Something went wrong: Service: findBuyerGroupPointRollUps", error);
        throw new Error(error);
    }
};

module.exports.findBuyerPoint = async ({ buyer_id = "", customer_id = "", order_id = "" }) => {
    try {
        let match = { delete_point_flg: "N" };

        if (customer_id) match["customer_id"] = customer_id;
        if (buyer_id) match["buyer_id"] = buyer_id;
        if (order_id) match["order_id"] = order_id;

        let result = await BuyerPoint.find(match).sort({ _id: -1 });
        if (result) return formatMongoData(result);
        else return [];
    } catch (error) {
        console.log("Something went wrong: Service: findBuyerPoint", error);
        throw new Error(error);
    }
};

module.exports.findBuyerGroup = async ({ id = "", group_code = "", count = false }) => {
    try {
        let match = { delete_group_flg: "N" };

        if (group_code) match["group_code"] = group_code;
        if (id) match["_id"] = id;

        let result = await BuyerGroup.findOne(match).sort({ _id: -1 });
        if (result) return formatMongoData(result);
        else return false;
    } catch (error) {
        console.log("Something went wrong: Service: findBuyerGroup", error);
        throw new Error(error);
    }
};
module.exports.masterReset = async () => {
    try {        
        await LineItem.deleteMany();
        await Order.deleteMany();
        await BuyerGroupRollUps.deleteMany();
        await BuyerPoint.deleteMany();
        await BuyerRollUps.deleteMany();
        await Cart.deleteMany();
        await TempLineItem.deleteMany();
        await TempOrder.deleteMany();

        return true;
    } catch (error) {
        console.log("Something went wrong: Service: masterReset", error);
        throw new Error(error);
    }
};

module.exports.masterResetAll = async () => {
    try {        
        await LineItem.deleteMany();
        await Order.deleteMany();
        await BuyerGroupRollUps.deleteMany();
        await BuyerPoint.deleteMany();
        await BuyerRollUps.deleteMany();
        await Cart.deleteMany();

        await UserMaster.deleteMany();
        await UserMapping.deleteMany();
        await ZsdCustomer.deleteMany();
        await ZmlDesignation.deleteMany();

        return true;
    } catch (error) {
        console.log("Something went wrong: Service: masterResetAll", error);
        throw new Error(error);
    }
};