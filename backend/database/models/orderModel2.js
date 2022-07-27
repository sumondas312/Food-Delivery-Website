const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    total_meters: String,
    user_id: String,
    order_id: String,
    user_role: String,
    agent_id: String,
    buyer_id: String,
    rsm_id: String,
    asm_id: String,
    national_id: String,
    zonal_id: String,
    payment_status: String,
    payment_method: String,
    season: String,
    status: String,
    category: String,
    total_units: String,
    total_meters: String,
    exMillPrice: String,
    total_value: String,
    area_code: String,
    booking_sub_category: String,
    expected_delivery_date: String
});

module.exports = mongoose.model('order2db', orderSchema);

