const constants = require('../constants');
const { formatMongoData } = require('../helpers/dbHelper');
const Order = require('../database/models/orderModel');
const OrderLineItems = require('../database/models/lineItemModel');
const UserDetails = require('../database/models/userMasterModel');
var pdf = require('pdf-creator-node');
var fs = require('fs');

// Order booking report
module.exports.orderBookingReportpdf = async (req) => {
  var html = fs.readFileSync('helpers/report/order_booking_report.html', 'utf8');
  var path = 'pdf/order_booking_' + Math.floor(Math.random() * 10000) + '.pdf';

  req.order_id="WOTA8ID65R1788";
  let order = await Order.findOne({order_id:req.order_id});
  let items=await OrderLineItems.find({order_id:req.order_id});
  let userdetails=await UserDetails.findById(order.user_id);
  var itemDetails=[];

  for(i=0;i<items.length;i++){
    var arrayData={ no:i+1, serialno:items[i].serial_no , qualityno: items[i].material_no, uc: items[i].ulc, units: items[i].shade, dp:items[i].delivery_period, qty: items[i].units};
    itemDetails.push(arrayData);
  }

  // var itemDetails = [
  //   { no: '1', serialno: '115', qualityno: '1144/904594', uc: '38', units: '1/1....', dp: '11', qty: '6.50'},
  //   { no: '1', serialno: '115', qualityno: '1144/904594', uc: '38', units: '1/1....', dp: '11', qty: '6.50'},
  //   { no: '1', serialno: '115', qualityno: '1144/904594', uc: '38', units: '1/1....', dp: '11', qty: '6.50'},
  //   { no: '1', serialno: '115', qualityno: '1144/904594', uc: '38', units: '1/1....', dp: '11', qty: '6.50'},
  //   { no: '1', serialno: '115', qualityno: '1144/904594', uc: '38', units: '1/1....', dp: '11', qty: '6.50'},
  // ];
  
  try {
    var options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
    };
    var document = {
      html: html,
      data: {
        season: order.season,
        buyer_name: userdetails.name,
        buyer_code: userdetails.customer_id,
        city: '124 NEEL PRESIDENCYMCCH SOC PANVEL',
        tagno: '0000000000',
        itemDetails:itemDetails,
        totalquamtity:order.total_units,
        totalvalue:order.total_value,
        mtrs:order.total_meters
      },
      path: 'downloads/' + path,
      type: '',
    };

    pdf.create(document, options).then((res) => {
      console.log(res);
    });
    return path;
  } catch (error) {
    console.log('Something went wrong', error);
    return { status: false, message: error };
  }
};
