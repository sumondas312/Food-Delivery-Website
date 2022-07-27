const constants = require('../constants');
const adminService = require('../services/adminService');
const cartService = require('../services/cartService');
const importService = require('../services/importService');
const userService = require('../services/userLoginService');
const productService = require("../services/productService");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const jwt = require('jsonwebtoken');
const fs = require('fs');
const axios = require('axios');
const bcrypt = require('bcrypt');
const csv = require('csvtojson');
const { formatMongoData, checkObjectId } = require("../helpers/dbHelper");
const moment = require("moment");

exports.adminLogin = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        const { email, password } = req.body;
        const responseFromService = await adminService.admin_login_service({ email, password });

        if (responseFromService.status) {
            const token = jwt.sign({
                id: responseFromService.data.id,
                user_type: responseFromService.data.user_type,
                email: responseFromService.data.email,
            },
                process.env.SECRET_KEY || "buyraymond-secret-key", {
                expiresIn: "30d"
            });

            response.status = 200;
            response.message = constants.userMessage.LOGIN_SUCCESS;
            response.body = {
                name: responseFromService.data.name,
                role: responseFromService.data.user_type,
                loginId: responseFromService.data.customer_id,
                token: token,
                id: responseFromService.data.id,
            };
            return res.status(response.status).send(response);
        } else {
            response.status = 400;
            response.message = responseFromService.message;
            return res.status(response.status).send(response);
        }
    } catch (error) {
        console.log('Something went wrong: Controller: adminLogin', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

exports.fetchAllUsersData = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let data = [];
        const { customer_no, email } = req.query;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        if (user_role.toLowerCase() !== 'admin') throw new Error(`You are not authorised!!!`);

        let search_term = { is_deleted: 'n', status: 'Active' };
        if (req.query.email) search_term['email'] = req.query.email;
        if (req.query.customer_no) search_term['customer_no'] = req.query.customer_no;
        if (req.query.skip) search_term['skip'] = req.query.skip;
        if (req.query.limit) search_term['limit'] = req.query.limit;

        if (req.query && (req.query.email || req.query.customer_no)) {
            let user_info = await userService.searchUsers({ ...search_term });
            if (user_info.length) {
                data = user_info.map(item => {
                    let obj = {
                        name: `${item.name}-${item.customer_id}`,
                        email: `${item.email}`,
                        customerId: `${item.customer_id}`,
                        id: item.id
                    }
                    return obj;
                });

                response.status = 200;
                response.count = await userService.searchUsers({ ...search_term, count: true });
                // response.message = constants.cartMessage.RESOURCE_FOUND;
                response.body = {
                    users: data
                };
            }
        }
        else {
            search_term['all_users'] = true;
            let user_info = await userService.searchUsers({ ...search_term });
            if (user_info.length) {
                data = user_info.map(item => {
                    let obj = {
                        name: `${item.name}-${item.customer_id}`,
                        email: `${item.email}`,
                        customerId: `${item.customer_id}`,
                        id: item.id
                    }
                    return obj;
                });

                response.status = 200;
                response.count = await userService.searchUsers({ ...search_term, count: true });
                // response.message = constants.cartMessage.RESOURCE_FOUND;
                response.body = {
                    users: data
                };
            }
        }
    } catch (error) {
        console.log('Something went wrong: Controller: fetchAllUsersData', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

exports.updateUserPassword = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let user_info;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        if (user_role.toLowerCase() !== 'admin') throw new Error(`You are not authorised!!!`);

        if (req.params.id && req.body.password) {
            let key = req.body.password.trim();
            let pass = await bcrypt.hash(key, 12);
            user_info = await userService.updateUser({ id: req.params.id, updateInfo: { password: pass } });
        }
        if (user_info) {
            response.status = 200;
            response.message = constants.userMessage.PASSWORD_CHANGE_SUCCESS;
            response.body = {
                users: user_info
            };
        }
    } catch (error) {
        console.log('Something went wrong: Controller: updateUserPassword', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
}

exports.insertBannerImg = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let random = Math.floor((Math.random() * 10000000) + 1);
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        if (user_role.toLowerCase() !== 'admin') throw new Error(`You are not authorised!!!`);
        if (!req.file) throw new Error(`Please select an Image!!!`);

        let oldpath = req.file.path;
        let type = req.body.type.toLowerCase();
        let name = req.file.originalname.replace(/ /g, "_")
        let new_name = `${type}_${random}_${name}`
        let img_path = `./uploads/media/${new_name}`;
        fs.rename(oldpath, img_path, function (err) {
            if (err) throw err;
        });
        let data = {
            img: new_name,
            type: type,
            is_deleted: 'n',
            status: 'Active',
        }
        let banner = await adminService.insertImages(data);
        if (banner) {
            response.status = 201;
            response.message = constants.BANNER_IMAGE.UPLOADED;
        } else {
            response.message = constants.BANNER_IMAGE.TRY_AGAIN;
        }
    } catch (error) {
        console.log("Something went wrong: Controller: insertBannerImg", error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

exports.updateBannerImg = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let random = Math.floor((Math.random() * 10000000) + 1);
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        if (user_role.toLowerCase() !== 'admin') throw new Error(`You are not authorised!!!`);
        let data = {};
        if (req.file) {
            let oldpath = req.file.path;
            let type = req.body.type;
            let name = req.file.originalname.replace(/ /g, "_")
            let new_name = `${type}_${random}_${name}`
            let img_path = `./uploads/media/${new_name}`;
            fs.rename(oldpath, img_path, function (err) {
                if (err) throw err;
            });
            data['img'] = new_name;
        }
        if (req.body.delete_flg && req.body.delete_flg == '1') data['is_deleted'] = 'y';
        if (req.body.status) data['status'] = (req.body.status.toLowerCase() == 'active') ? 'Active' : 'Inactive';

        let banner = await adminService.updateImages({ id: req.params.id, updateInfo: data });
        if (banner) {
            let data = {
                img: banner.img,
                status: banner.status,
                id: banner.id
            }
            response.status = 200;
            response.message = constants.BANNER_IMAGE.UPDATED;
            response.body = { banner: data }
        } else {
            response.message = constants.BANNER_IMAGE.TRY_AGAIN;
        }
    } catch (error) {
        console.log("Something went wrong: Controller: updateBannerImg", error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

exports.fetchImageForBanner = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        if (user_role.toLowerCase() !== 'admin') throw new Error(`You are not authorised!!!`);

        let data;
        let search = {};
        if (req.query.type) search['type'] = req.query.type;
        if (req.query.id) search['id'] = req.query.id;
        let banner = await adminService.find_images({ ...search });
        data = banner.map(item => {
            let obj = {
                img: `${process.env.MEDIA_PATH + "media/"}${item.img}`,
                id: item.id
            }
            return obj;
        });
        if (banner.length && req.query.id) {
            response.status = 200;
            response.body = {
                banner: data[0]
            };
        }
        else if (banner.length && !req.query.id) {
            response.status = 200;
            response.body = {
                banner: data
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

exports.orderListForAdmin = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let responseFromService = [];
        let search_key = {};
        let authorised = false;
        const { category, zonal, rsm, asm, agent, buyer, national, orderId, skip, limit } = req.query;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        if (skip) search_key['skip'] = skip;
        if (limit) search_key['limit'] = limit;

        if (user_role.toLowerCase() === 'admin') {
            if (category) search_key['category'] = category;
            if (zonal) search_key['zonal_id'] = zonal;
            if (rsm) search_key['rsm_id'] = rsm;
            if (asm) search_key['asm_id'] = asm;
            if (agent) search_key['agent_id'] = agent;
            if (buyer) search_key['buyer_id'] = buyer;
            if (orderId) search_key['order_id'] = orderId;
            if (national) search_key['national_id'] = national;
            authorised = true;
        } else throw new Error(`You are not authorised!!!`);


        if (search_key && Object.keys(search_key).length !== 0) responseFromService = await adminService.findOrders({ ...search_key });
        if (responseFromService.length) {
            for (let item of responseFromService) {
                let AGENT;
                let BUYER;
                if (item.agent_id) {
                    AGENT = item.agent_id;
                }
                if (item.buyer_id.name) BUYER = item.buyer_id.name;

                item['agent_name'] = AGENT ? AGENT.name : '';
                item['agency'] = AGENT ? `${AGENT.agent_agency}-${AGENT.agent_county_code}` : '';
                item['buyer_name'] = BUYER ? BUYER : '';
                item['collection'] = item.collection_period ? item.collection_period : '';
                item['order_on'] = moment(item.createdAt).format("DD-MM-YYYY");

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
            };
            response.status = 200;
            response.message = constants.orderMessage.RESOURCE_FOUND;
            search_key['count'] = true;
            response.count = await adminService.findOrders({ ...search_key });
            response.body = { data: responseFromService };
        } else {
            response.status = 202;
            response.message = constants.orderMessage.RESOURCE_NOT_FOUND;
        }
    } catch (error) {
        console.log('Something went wrong: Controller: orderListForAdmin', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

exports.singleOrderDetailsForAdmin = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let items = [];
        checkObjectId(req.params.id);
        let admin_access = false;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        if (user_role.toLowerCase() === 'admin') admin_access = true;
        else throw new Error(`You are not authorised!!!`);

        let responseFromService = await adminService.findOrders({ id: req.params.id });
        if (responseFromService.length) {
            let lineItems = await adminService.findLineItem({ order_id: responseFromService[0].order_id });
            for (let item of lineItems) {
                let pdt = await productService.find_material({ id: item.product_id })
                item['img'] = pdt.length ? (pdt[0].IMG_URL ? pdt[0].IMG_URL : `https://myraymond.com/media/no-image.jpg`) : `https://myraymond.com/media/no-image.jpg`;
                delete item.order_id;
                delete item.createdAt;
                delete item.updatedAt;
                item.mrp = '9999';
                items.push(item);
            }
            let AGENT;
            let BUYER;
            if (responseFromService[0].agent_id) AGENT = responseFromService[0].agent_id;
            if (responseFromService[0].buyer_id) BUYER = responseFromService[0].buyer_id.name;

            responseFromService[0]['agent_name'] = AGENT ? AGENT.name : '';
            responseFromService[0]['agent_agency'] = AGENT ? `${AGENT.agent_agency}-${AGENT.agent_county_code}` : '';
            responseFromService[0]['buyer_name'] = BUYER ? BUYER : '';
            responseFromService[0]['collection'] = responseFromService[0].collection_period;
            responseFromService[0]['order_on'] = moment(responseFromService[0].createdAt).format("DD-MM-YYYY");

            responseFromService[0]['total_mrp'] = '001001';
            responseFromService[0]['items'] = items;

            delete responseFromService[0].user_id;
            delete responseFromService[0].payment_status;
            delete responseFromService[0].payment_method;
            delete responseFromService[0].user_role;
            delete responseFromService[0].updatedAt;
            delete responseFromService[0].agent_id;
            delete responseFromService[0].buyer_id;
            delete responseFromService[0].rsm_id;
            delete responseFromService[0].asm_id;
            delete responseFromService[0].national_id;
            delete responseFromService[0].zonal_id;
            delete responseFromService[0].collection_period;

            response.status = 200;
            response.message = constants.orderMessage.RESOURCE_FOUND;
            response.count = await adminService.findOrders({ user_id, count: true });
            response.body = { data: responseFromService };
        } else {
            response.status = 202;
            response.message = constants.orderMessage.RESOURCE_NOT_FOUND;
        }
    } catch (error) {
        console.log('Something went wrong: Controller: singleOrderDetailsForAdmin', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

exports.generateOrderpdfForAdmin = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let access_request = false;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        if (user_role === 'admin') access_request = true;
        else throw new Error(`You are not authorised!!!`);
        if (!access_request) throw new Error(`You are not authorised!!!`);

        let data = await adminService.pdfGeneretorByOrderId({ orderId: req.query.orderId });
        if (data) {
            response.status = 200;
            response.message = constants.orderMessage.DOWNLOADED;
            response.body = {
                link: process.env.MEDIA_PATH + `invoice/${data}.pdf`
            }
        } else {
            response.message = constants.orderMessage.TRY_AGAIN;
        }
    } catch (error) {
        console.log('Something went wrong: Controller: generateOrderpdfForAdmin', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

exports.exportOrdersForAdmin = async (req, res) => {
    let access_request = false;
    if (!req.body) throw new Error(`You are not authorised!!!`);
    const { user_id, user_role } = req.body;
    if (user_role === 'admin') access_request = true;
    else throw new Error(`You are not authorised!!!`);
    if (!access_request) throw new Error(`You are not authorised!!!`);

    let random = Math.floor((Math.random() * 10000000) + 1);
    let createFolder = process.env.PHYSICAL_MEDIA_PATH + "order_export/";
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
        ]
    });
    let response = { ...constants.defaultServerResponse };
    try {
        let records = [];
        let exists = [];
        let search_key = {};
        const { category } = req.query;
        
        const { user_id, user_role } = req.body;
        if (user_role.toLowerCase() === 'admin') {
            if (category) search_key['category'] = category;
            search_key['status'] = 'Active';
            access_request = true;
        } else throw new Error(`You are not authorised!!!`);
        if (!access_request) throw new Error(`You are not authorised!!!`);

        if (access_request) exists = await adminService.findOrdersForAdminExport({ ...search_key });
        if (exists.length && exists.length !== 0) {
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
                    order_by: ORDER ? ORDER.name : '',
                    order_for: BUYER ? BUYER.name : '',
                    rsm_id: RSM ? RSM.name : '',
                    agent_id: AGENT ? AGENT.name : '',
                    agent_agency: AGENT ? `${AGENT.agent_agency}-${AGENT.agent_county_code}` : '',
                    asm_id: ASM ? ASM.name : '',
                    national_id: NH ? NH.name : '',
                    zonal_id: ZONAL ? ZONAL.name : '',
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
                    createdAt: exist.createdAt ? moment(exist.createdAt).format('DD-MM-YYYY') : '',
                })
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
        console.log('Something went wrong: Controller: exportOrdersForAdmin', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};
















//offer
module.exports.addOffers = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        const token = req.headers.authorization.split('Bearer')[1].trim();
        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'buyraymond-secret-key');
        let userData = await userService.searchLoginUser({ id: decoded.id });
        if (userData.user_type.toLowerCase() !== 'admin') throw new Error(`You are not authorised to create!!!`);
        if (!userData) throw new Error(`You are not authorised to create!!!`);
        let user_id = decoded.id;
        let user_role = decoded.user_type;

        const { name, email, mobile, address, pincode, district, city, state, agent } = req.body;

        let new_insert = {
            name: name,
            email: email,
            mobile: mobile,
            city: city,
            state: state,
            district: district,
            pincode: pincode,
            address: address,
            password: '$2b$12$t1ERHiS05YmXWWs/LFr3HuswPSCLU3iIGKhtsvft7imp6lBpd4t6y',
            is_deleted: 'n',
            status: "Active",
            format_type: '6073fccb1996fceb11d1a960',//default value until any instruction come
            customer_id: await userService.uniqueCodeGeneratorForCustomerId(),

            rsm_id: userData.rsm_id,
            national_id: userData.national_id,
            zonal_id: userData.zonal_id,
            asm_id: user_id,
            agent_id: agent,
            user_type: 'buyer'
        }


        // await importService.insertUserMasterFile(new_insert);

        response.status = 200;
        response.message = constants.userMessage.UPDATE;

    } catch (error) {
        console.log('Something went wrong: Controller: addOffers', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};

//buyer
module.exports.addBuyerProfile = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        const token = req.headers.authorization.split('Bearer')[1].trim();
        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'buyraymond-secret-key');
        let userData = await userService.searchLoginUser({ id: decoded.id });

        if (!userData) throw new Error(`You are not authorised to create!!!`);
        else if (userData.user_type.toLowerCase() !== 'admin') throw new Error(`You are not authorised to create!!!`);

        let user_id = decoded.id;
        let user_role = decoded.user_type;

        const { name, email, mobile, address, pincode, district, city, state, agent, asm, zonal, national, rsm } = req.body;

        let new_insert = {
            name: name,
            email: email,
            mobile: mobile,
            city: city,
            state: state,
            district: district,
            pincode: pincode,
            address: address,
            password: '$2b$12$t1ERHiS05YmXWWs/LFr3HuswPSCLU3iIGKhtsvft7imp6lBpd4t6y',
            is_deleted: 'n',
            status: "Active",
            // format_type: '6073fccb1996fceb11d1a960',//default value until any instruction come
            customer_id: await userService.uniqueCodeGeneratorForCustomerId(),

            rsm_id: rsm,
            national_id: national,
            zonal_id: zonal,
            asm_id: asm,
            agent_id: agent,
            user_type: 'buyer'
        }


        await importService.insertUserMasterFile(new_insert);

        response.status = 200;
        response.message = constants.userMessage.UPDATE;

    } catch (error) {
        console.log('Something went wrong: Controller: addBuyerProfile', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};