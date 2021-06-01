const mongoose = require("mongoose");
const schema = mongoose.schema;

const AssociatedZipSchema = new mongoose.Schema({
    zip: {
        type: Number
    },
    associatedZips: {
        type: Number
    }
});

module.exports = AssociatedZip = mongoose.model('AssociatedZip',AssociatedZipSchema);