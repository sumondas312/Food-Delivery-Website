const mongoose = require('mongoose');

const pdtSchema = new mongoose.Schema({
    SEASON: String,
    ZYEAR: String,
    BEZEI: String,
    FMONTH: String,
    TMONTH: String,
    NO_OF_MTH: String,
    SEASON_STATUS: String,
    EXTRACTION_DT: String,
    EXTRACTION_BY: String,
    SEASON_TYPE: String    
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

module.exports = mongoose.model('zsd_season', pdtSchema, 'zsd_season');