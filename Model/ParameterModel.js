const mongoose = require("mongoose");
const schema = mongoose.schema;

const ParameterSchema = new mongoose.Schema({
    year: {
        type: Number
    },
    type: {
        type: String
    },
    rate: {
        type: Number
    },
    zip: {
        type: Number
    },
    avg: {
        type: Number
    }
});

module.exports = Parameter = mongoose.model('Parameter',ParameterSchema);