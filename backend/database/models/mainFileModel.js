const { number, string } = require('@hapi/joi');
const { ObjectId } = require('mongoose');
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    cust_grp: String,
    sales_district: String,
    sales_grp: String,
    market_segment: String,
    customer_grp: String,
    sales_doc_type: String,
    usage: String,
    country_code: String,
    area_manager_desg: String,
    regional_manager: String,
    zonal_manager: String,
    national_head: String,
    agent_name: String,
    agent_agency: String,
    agency_area_name: String,
    business_area: String,
    fso_name: String,
    national_head_email: String,
    rsm_email: String,
    asm_email: String,
    zonal_email: String,
    agent_email:String,
    fso_email: String,
    national_head_mobile: String,
    rsm_mobile: String,
    asm_mobile: String,
    zonal_manager_mobile: String,
    agent_mobile: String,
    fso_mobile: String,
    sales_org: String,
    unique_key: String,
}, {
    timestamps: true,
    toObject: {
        transform: function (doc, ret, options) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

module.exports = mongoose.model('master_file', storeSchema, 'master_file');