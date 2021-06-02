const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ParameterSchema = new Schema({
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
    }
});

module.exports = Parameter = mongoose.model('Parameter',ParameterSchema);