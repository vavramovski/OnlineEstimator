const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AssociatedZipSchema = new Schema({
    zip: {
        type: Number
    },
    associatedZip: {
        type: Number
    }
});

module.exports = AssociatedZip = mongoose.model('AssociatedZip',AssociatedZipSchema);