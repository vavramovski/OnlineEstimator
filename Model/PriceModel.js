const mongoose = require("mongoose");
const schema = mongoose.schema;

const PriceSchema = new mongoose.Schema({
    zip: {
        type: Number
    },
    year: {
        type: Number
    },
    house: {
        type: Number
    },
    houseNew: {
        type: Number
    },
    ppe: {
        type: Number
    },
    ppeNew: {
        type: Number
    }
});

module.exports = Price = mongoose.model('Price',PriceSchema);