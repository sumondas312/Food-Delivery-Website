const MainFile = require("../database/models/mainFileModel");
const UserMaster = require("../database/models/userMasterModel");
const UserMapping = require("../database/models/userMappingModel");
const ZsdCustomer = require('../database/models/zsdCustomerDetailsModel');
const ZmlDesignation = require('../database/models/zmlDesignationModel');
const { formatMongoData, checkObjectId } = require("../helpers/dbHelper");
const constants = require("../constants/index");
const bcrypt = require("bcrypt");
const REQUEST = require("../database/models/profileUpdateRequestModel");
const IMAGES = require("../database/models/allBannerImageModel");
const Order = require("../database/models/orderModel");
const Product = require("../database/models/productModel");
const UlcConversion = require("../database/models/ulcMasterModel");
const LineItem = require("../database/models/lineItemModel");

const moment = require("moment");
let pdf = require("html-pdf");
let ejs = require("ejs");
let path = require("path");

let uniqueCodeGenerator = async () => {
    try {
        function randomString(length, chars) {
            let result = "";
            for (let i = length; i > 0; --i)
                result += chars[Math.round(Math.random() * (chars.length - 1))];
            return result;
        }
        let existCheck = async ({ code }) => {
            let exist = await UserMaster.findOne({ customer_id: code });
            if (exist) {
                let code = randomString(8, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
                return await existCheck({ code });
            } else {
                return code;
            }
        };
        return code = await existCheck({ code: randomString(8, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ") });
    } catch (error) {
        console.log('Something went wrong: Service: uniqueCodeGenerator', error);
        throw new Error(error);
    }
};


exports.admin_login_service = async ({ email, password, temp_user_id }) => {
    try {
        let user = await UserMaster.findOne({ email, status: "Active", is_deleted: "n" });
        if (!user) {
            return { status: false, message: constants.userMessage.USER_NOT_FOUND };
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return { status: false, message: constants.userMessage.INVALID_PASSWORD };
        }
        let userDetail = await UserMaster.findOneAndUpdate(
            {
                _id: user.id,
            },
            { last_login: new Date() },
            {
                new: true,
                useFindAndModify: false,
            }
        );

        return { status: true, message: "success", data: formatMongoData(userDetail) };
    } catch (error) {
        console.log("Something went wrong: Service: admin_login_service", error);
        return { status: false, message: error };
    }
};

// exports.searchLoginUser = async ({ id = "" }) => {
//     try {
//         checkObjectId(id);
//         let user = await UserMaster.findById({ _id: id }).sort({ _id: -1 });

//         return formatMongoData(user);
//     } catch (error) {
//         console.log("Something went wrong: Service: searchLoginUser", error);
//         return { status: false, message: error };
//     }
// };

// exports.searchUsers = async ({
//     id = "",
//     rsm_id = "",
//     national_id = "",
//     zonal_id = "",
//     asm_id = "",
//     agent_id = "",
//     user_type = ""
// }) => {
//     try {
//         let match = {};

//         if (id) match["_id"] = id;
//         if (rsm_id) match["rsm_id"] = rsm_id;
//         if (national_id) match["national_id"] = national_id;
//         if (zonal_id) match["zonal_id"] = zonal_id;
//         if (asm_id) match["asm_id"] = asm_id;
//         if (agent_id) match["agent_id"] = agent_id;
//         if (user_type) match["user_type"] = user_type;

//         let user = await UserMaster.find(match, { password: 0 }).sort({
//             _id: -1
//         });

//         if (user.length) return formatMongoData(user);
//         else return [];
//     } catch (error) {
//         console.log("Something went wrong: Service: searchUsers", error);
//         return {
//             status: false,
//             message: error
//         };
//     }
// };

// exports.updateUser = async ({ id, updateInfo }) => {
//     try {
//         checkObjectId(id);

//         let userDetail = await UserMaster.findOneAndUpdate({
//             _id: id,
//         }, updateInfo, {
//             new: true,
//             useFindAndModify: false,
//         });

//         return formatMongoData(userDetail);
//     } catch (error) {
//         console.log("Something went wrong: Service: updateUser", error);
//         return { status: false, message: error };
//     }
// };

exports.insertImages = async (serviceData) => {
    try {
        let data = new IMAGES({ ...serviceData });
        let user = await data.save();
        return formatMongoData(user);
    } catch (error) {
        console.log("Something went wrong: Service: insertImages", error);
        throw new Error(error);
    }
};

exports.updateImages = async ({ id, updateInfo }) => {
    try {
        checkObjectId(id);
        let userDetail = await IMAGES.findOneAndUpdate(
            { _id: id }, updateInfo, {
            new: true,
            useFindAndModify: false,
        });
        return formatMongoData(userDetail);
    } catch (error) {
        console.log("Something went wrong: Service: updateImages", error);
        throw new Error(error);
    }
};

exports.find_images = async ({ skip = 0, limit = 0, id = '', count = false, type = "", sub_type = "" }) => {
    try {
        let match = { status: "Active", is_deleted: "n" };
        if (type) match["type"] = type;
        if (sub_type) match["sub_type"] = eval('{ $regex: /' + sub_type + '/gi }');
        if (id) match["_id"] = id;

        if (count) return await IMAGES.countDocuments(match);
        
        const product = await IMAGES.find(match, { img: 1, _id: 1, type: 1 }).sort({ _id: -1 }).skip(parseInt(skip)).limit(parseInt(limit));
        if (product.length) return formatMongoData(product);
        else return [];
    } catch (error) {
        console.log("Something went wrong: Service: find_images", error);
        return { status: false, message: error };
    }
};

exports.findOrders = async ({
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
    zonal_id = '',
    rsm_id = '',
    asm_id = '',
    national_id = '',
    category = '',
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

        if (count) return await Order.countDocuments(match);

        const data = await Order.find(match).sort({ _id: -1 })
            .populate({ path: "buyer_id", select: 'name' })
            .populate({ path: "agent_id", select: ['agent_agency', 'name', 'agent_county_code'] })
            .skip(parseInt(skip)).limit(parseInt(limit));
        
        if (data.length) return formatMongoData(data);
        else return []
    } catch (error) {
        console.log("Something went wrong: Service: findOrders", error);
        return { status: false, message: error };
    }
};

exports.findOrdersForAdminExport = async ({
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
    zonal_id = '',
    rsm_id = '',
    asm_id = '',
    national_id = '',
    category = '',
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

        if (count) return await Order.countDocuments(match);

        const data = await Order.find(match).sort({ _id: -1 })
            .populate({ path: "buyer_id", select: 'name' })
            .populate({ path: "user_id", select: 'name' })
            .populate({ path: "asm_id", select: 'name' })
            .populate({ path: "rsm_id", select: 'name' })
            .populate({ path: "zonal_id", select: 'name' })
            .populate({ path: "national_id", select: 'name' })
            .populate({ path: "agent_id", select: ['agent_agency', 'name'] })
            .skip(parseInt(skip)).limit(parseInt(limit));

        if (data.length) return formatMongoData(data);
        else return []
    } catch (error) {
        console.log("Something went wrong: Service: findOrdersForAdminExport", error);
        return { status: false, message: error };
    }
};


exports.findLineItem = async ({
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
        else return []
    } catch (error) {
        console.log("Something went wrong: Service: findLineItem", error);
        return { status: false, message: error };
    }
};

module.exports.pdfGeneretorByOrderId = async ({ orderId }) => {
    try {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        let order = await Order.findOne({ order_id: orderId })
            .populate({ path: "buyer_id", select: 'name' })
            .populate({ path: "agent_id", select: ['agent_agency', 'name'] })
            .sort({ _id: -1 });
        if (order) {
            order = formatMongoData(order);
            // let buyer = await UserMaster.findById({ _id: order.buyer_id });
            // buyer = formatMongoData(buyer);
            let buyer_name = order.buyer_id.name;
            let agency_name = order.agent_id.agent_agency;
            let random = Math.floor((Math.random() * 10000000) + 1);
            order.createdAt = moment(order.createdAt).format('DD-MM-YYYY');
            let order_line_item = await LineItem.find({ order_id: orderId }).sort({ order_id: -1 })
            order_line_item = formatMongoData(order_line_item);

            if (order_line_item.length) {
                for (let item of order_line_item) {
                    let total_meters = 0.0;
                    // let exMillPrice = 0.0;
                    let total_value = 0.0;
                    let ulc_conversion = await UlcConversion.findOne({ ulc: item.ulc });
                    let product = await Product.findOne({ id: item.product_id });
                    if (ulc_conversion) {
                        total_meters += (parseFloat(item.units) * parseFloat(ulc_conversion.meters));
                        // exMillPrice += (parseFloat(product.EX_FACTORY_PRICE) * parseFloat(item.units));
                        total_value += (parseFloat(item.units) * parseFloat(product.EX_FACTORY_PRICE) * parseFloat(ulc_conversion.meters));
                    }
                    item['total_meters'] = total_meters;
                    // item['exMillPrice'] = exMillPrice;
                    item['total_value'] = total_value;
                }
            }
            //geneating pdf
            ejs.renderFile(path.join(__dirname, "../helpers/invoiceTemplate", "index.ejs"),
                {
                    order_id: orderId,
                    order,
                    order_line_item,
                    buyer_name,
                    agency_name,
                    season: order.season,
                    area_code: order.area_code,
                }, async (err, data) => {
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


                        await pdf.create(data, options).toFile(path.join(__dirname, `../uploads/invoice/${orderId}-${random}.pdf`), async (err, data) => {
                            if (err) console.log(err);
                            else console.log("file created");
                        });

                    }
                });
            await sleep(1500);
            return `${orderId}-${random}`
        } else {
            return false;
        }
    } catch (error) {
        console.log("Something went wrong: Service: pdfGeneretorByOrderId", error);
        return { status: false, message: error };
    }
};