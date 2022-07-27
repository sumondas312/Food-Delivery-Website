const constants = require('../constants');
const fetch = require('node-fetch');
const fs = require('fs');

const mustache = require("mustache");
const iterateObject = require("iterate-object");
const moment = require('moment');
const Invoice = require("nodeice");
const { promisify } = require("util")

const fsfileread = {
    readdir: promisify(fs.readdir),
    readFile: promisify(fs.readFile),
    // etc
};
function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
    try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

        const negativeSign = amount < 0 ? "-" : "";

        let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;

        return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
        console.log(e)
    }
};
module.exports.generateSalesInvoice = async (data) => {
    try {

        const token = req.headers.authorization.split('Bearer')[1].trim();
        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'buyraymond-secret-key');
        let userData = await userService.searchLoginUser({ id: decoded.id });
        if (!userData) throw new Error(`You are not authorised!!!`);

        let user_id = decoded.id;
        // let user_role = decoded.user_type;
        const { category, zonal, rsm, asm, agent, buyer, national, orderId } = req.query;
        const responseFromService = await orderService.findOrders({
            // user_id: asm,
            category,
            // zonal_id: zonal,
            // rsm_id: rsm,
            // agent_id: agent,
            // buyer_id: buyer,
            order_id: orderId,
            // national_id: national,
            skip: req.query.skip,
            limit: req.query.limit,
        });
        if (responseFromService) {
            for (let item of responseFromService) {
                let AGENT = await userService.searchLoginUser({ id: item.agent_id });
                let BUYER = await userService.searchLoginUser({ id: item.buyer_id });

                item['agent_name'] = AGENT.name;
                item['buyer_name'] = BUYER.name;
                item['collection'] = item.collection_period ? item.collection_period : '';
                item['order_on'] = moment(item.createdAt).format("DD-MM-YYYY");

                delete item.user_id;
                delete item.payment_status;
                delete item.payment_method;
                delete item.user_role;
                delete item.updatedAt;
                delete item.agent_id;
                delete item.buyer_id;
            }

            response.status = 200;
            response.message = constants.orderMessage.RESOURCE_FOUND;
            // response.count = await orderService.findOrders({
            //     user_id,
            //     category,
            //     zonal_id: zonal,
            //     rsm_id: rsm,
            //     asm_id: asm,
            //     agent_id: agent,
            //     buyer_id: buyer,
            //     national_id: national,
            //     count: true,
            // });
            response.body = { data: responseFromService };
        }














        // console.log(data);
        var total_qty = 0;
        var total_rate = 0;
        var total_value = 0;
        var total_cgst_amount = 0;
        var total_sgst_amount = 0;
        var total_disc_amount = 0;
        var total_amount = 0;
        var tasks = [];
        var total_payment_done = 0;
        if (data.product_info) {
            for (let product of data.product_info) {
                var igst = 0;
                var cgst = parseFloat(product.tax1percentage);
                var sgst = parseFloat(product.tax2percentage);
                var cgst_amount = parseFloat(product.taxcomp1);
                var sgst_amount = parseFloat(product.taxcomp2);
                var igst_amount = 0;
                var discount = 0;
                var discount_amount = 0;
                var payment_rows = '';
                tasks.push(
                    {
                        slip_no: 'NA'
                        , quality_code: product.material_code
                        , description: product.item_desc
                        , shade: product.shade
                        , size: product.sizecd
                        , rate: formatMoney(product.rate)
                        , unitPrice: formatMoney(product.mrp)
                        , quantity: product.quantity
                        , value: formatMoney(product.gross_value)
                        , discount_amount: formatMoney(discount_amount)
                        , cgst: cgst.toFixed(2)
                        , sgst: sgst.toFixed(2)
                        , igst: igst
                        , cgst_amount: formatMoney(cgst_amount)
                        , sgst_amount: formatMoney(sgst_amount)
                        , igst_amount: formatMoney(igst_amount)
                        , discount: (product.discount / product.mrp) * 100
                        , discount_amount: formatMoney(product.discount)
                        , net_amount: formatMoney(product.net_value)
                    }
                );
                total_disc_amount += parseFloat(product.discount);
                total_cgst_amount += cgst_amount;
                total_sgst_amount += sgst_amount;
                total_amount += parseFloat(product.net_value);
                total_qty += parseFloat(product.quantity);
                total_rate += parseFloat(product.mrp);
                total_value += parseFloat(product.gross_value);
            }
        }
        if (data.payment.length) {
            for (let ind in data.payment) {
                total_payment_done += parseFloat(data.payment[ind].AMOUNT_PAID);
                data.payment[ind].AMOUNT_PAID = formatMoney(data.payment[ind].AMOUNT_PAID);
            }
        }
        if (data.store_data) {
            if (!data.store_data.gst_no) {
                data.store_data['gst_no'] = 'NA';
            }
            if (!data.store_data.cin_no) {
                data.store_data['cin_no'] = 'NA';
            }
        }
        var file2 = await fsfileread.readFile(__dirname + "/template/blocks/sales-payment-row.html", "utf-8");
        iterateObject(data.payment, function (payment, i) {
            // Set the additional fields and compute data
            // Render HTML for the current row
            payment_rows += mustache.render(file2, payment);
        });
        // console.log(data);
        // return;
        // Create the new invoice
        let myInvoice = new Invoice({
            config: {
                template: __dirname + "/template/sales-invoice.html"
                , tableRowBlock: __dirname + "/template/blocks/sales-invoice-row.html"
                , tablePaymentBlock: __dirname + "/template/blocks/sales-payment-row.html"
            }
            , data: {
                invoice: {
                    data: data
                    , number: {
                        order_id: 'ddfgdfgfdg'
                        , series: ""
                        , separator: ""
                        , id: 'fgdfg'
                    }
                    , dueDate: ""
                    , explanation: "Thank you for shopping with us!"
                    , currency: {
                        main: "INR"
                        , secondary: "₹"
                    }
                    , invoice_date: data.invoice[0].BILL_DATE
                    , total_qty: parseFloat(total_qty).toFixed(2)
                    , total_rate: formatMoney(total_rate)
                    , total_value: formatMoney(total_value)
                    , total_cgst_amount: formatMoney(total_cgst_amount)
                    , total_sgst_amount: formatMoney(total_sgst_amount)
                    , total_disc_amount: formatMoney(total_disc_amount)
                    , total_amount: formatMoney(total_amount)
                    , payment_rows: payment_rows
                    , invoice_no: data.invoice_id
                    , total_payment_done: formatMoney(total_payment_done)
                    , logo_url: process.env.MEDIA_PATH + "/Picture.png"
                    , go_green_url: process.env.MEDIA_PATH + "/go_green.jpg"
                    , store_format: data.store_format
                }
                , tasks: tasks
            }
            , seller: {
            }
            , buyer: {
            }
        });
        var dir = process.env.PHYSICAL_MEDIA_PATH + "ebill/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        var filename = data.invoice_id + ".pdf";
        // Render invoice as HTML and PDF
        // .toHtml(dir + data.invoice_id + ".html", (err, data) => {
        //   if(err){
        //     console.log(err);
        //   }else{
        //     console.log("Saved HTML file");
        //   }
        // })
        myInvoice.toPdf(dir + filename, (err, res) => {
            // console.log(res);
            if (err) {
                console.log("pdf generation error: ", err);
            } else {
                console.log("Saved pdf file");
            }
        });
    } catch (error) {
        console.log('Something went wrong: Controller: generateSalesInvoice', error);
    }
}