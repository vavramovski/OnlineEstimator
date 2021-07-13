const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ListingItemSchema = new Schema({
    parcelle: {
        type: String
    },
    price: {
        type: Number
    },
    ratio: {
        type: Number
    },
    type: {
        type: String
    },
    address: {
        type: String
    },
    landArea: {
        type: Number
    },
    livingArea: {
        type: Number
    },
    date: {
        type: Date
    },
    year: {
        type: Number
    },
    timeSinceTransaction: {
        type: Number
    },
    commune: {
        type: Number
    },
    rate: {
        type: Number
    },
    zip: {
        type: Number
    },
}, {collection: 'Listing'});

module.exports = ListingItem = mongoose.model('Listing', ListingItemSchema);