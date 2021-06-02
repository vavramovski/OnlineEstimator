const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AvgParameterSchema = new Schema({    
    zip: {
        type: Number
    },
    avg: {
        type: Number
    },
    type: {
        type: String
    }
});

module.exports = AvgParameter = mongoose.model('AvgParameter',AvgParameterSchema);