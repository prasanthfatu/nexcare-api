const mongoose = require('mongoose')

const medicaltestSchema = new mongoose.Schema({
    patientName : {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    maritalStatus: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    relationship: {
        type: String,
        required: true
    },
    emerPhone:{
            type: Number,
            required: true
    }

})

module.exports = mongoose.model('Test', medicaltestSchema)