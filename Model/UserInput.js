const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserInputSchema = new Schema({
    email: {
        type: String
    },
    zip: {
        type: Number
    },
    cyear: {
        type: Number
    },
    ryear: {
        type: Number
    },
    landArea: {
        type: Number
    },
    renovationCheck: {
        type: Boolean
    },
    renovationPrice: {
        type: Number
    },
    surfaceHabitable: {
        type: Number
    },
    typeSelected: {
        type: String
    },
    finalPrice: {
        type: Number
    },    
});

module.exports = UserInput = mongoose.model('UserInput',UserInputSchema);