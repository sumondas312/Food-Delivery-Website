const mongoose = require('mongoose');

const pdtSchema = new mongoose.Schema({
    SEASON: String,
    YEAR: String,
    QUALITY_NO: String,
    MATERIAL: String,
    SHADE: String,
    EXT_MATERIAL_GROUP: String,
    MATERIAL_GROUP: String,
    MATERIAL_GROUP1: String,
    PRODUCT_HIERARCHY: String,
    FLC_NO: String,
    MATERIAL1: String,
    ULC: String,
    X_DISTR_CHAIN_STATUS: String,
    FINISH_WEIGHT_PER_MTR: String,
    FINISH_WEIGHT_PER_MTR1: String,
    PRICING_REFERENCE_MATERIAL_ID: String,
    PRICING_REF_MATL: String,
    ALLOCATION_INDICATOR: String,
    COST_PER_MTR: String,
    PLAN_COST_PER_MTR: String,
    EX_FACTORY_PRICE: String,
    PLAN_EX_FACTORY_PRICE: String,
    PLAN_QTY: String,
    WHOSALE_PRICE: String,
    RETAIL_PRICE: String,
    DELIVERY_PERIOD: String,
    PLANT: String,
    GP_NUMBER: String,
    SEQUENCE_NUMBER_OF_MATERIAL: String,
    MATERIAL_GROUP2: String,
    MATERIAL_GROUP7: String,
    SPECIAL_FINISH: String,
    PIR_QTY: String,
    UNASSIGNED_STOCK: String,
    TOTAL_AVAILABILITY: String,
    DATE: String,
    USER_NAME: String,
    DELETION_INDICATOR: String,
    TRACKING_INDICATOR_FOR_SAMPLE_CARD_PRE: String,
    DATE_WHEN_SAMPLE_CARD_UPDATED: String,
    USER_NAME2: String,
    DATE2: String,
    USER_NAME3: String,
    DATE3: String,
    USER_NAME4: String,
    DESCRIPTION: String,
    MRP_SL_CL: String,
    FORECAST: String,
    FASHION: String,
    FOCUSED: String,
    EXCLUSION: String,
    NUMBER_OF_PIECES: String,
    IMG_URL: String,
    // product_category_flg: {
    //     type: String,
    //     required: true
    // },
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

module.exports = mongoose.model('zsd_seas_mast', pdtSchema, 'zsd_seas_mast');