const mongoose = require('mongoose')
const Schema = mongoose.Schema

const profileSchema = new Schema({
    image: {
        type: String,
    },
    name: {
        type: String,
    }
})

module.exports = mongoose.model('Profile', profileSchema)