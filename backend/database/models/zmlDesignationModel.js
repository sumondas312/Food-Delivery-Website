const mongoose = require('mongoose');

const pdtSchema = new mongoose.Schema({
    county_code: String,
    sales_group: String,
    sales_district: String,
    customer_group_5: String,
    customer_group: String,
    market_segment: String,
    sales_document_type: String,
    usage: String,
    division: String,
    area_manager: String,
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
    agent_email: String,
    fso_email: String,
    national_head_number: String,
    rsm_number: String,
    asm_number: String,
    zonal_manger_number: String,
    agent_number: String,
    fso_number: String,
    nh_sap_id: String,
    zm_sap_id: String,
    rm_sap_id: String,
    am_sap_id: String,
    agent_sap_id: String,
    fso_sap_id: String,
    net_flag: String,
    customer_key: String
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

module.exports = mongoose.model('zml_designation', pdtSchema, 'zml_designation');