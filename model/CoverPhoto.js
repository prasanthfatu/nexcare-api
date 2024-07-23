const mongoose = require('mongoose')
const Schema = mongoose.Schema

const coverPhotoSchema = new Schema({
    coverPhoto: {
        type: String
    },
    name: {
        type: String
    }
})

module.exports = mongoose.model('Coverphoto', coverPhotoSchema)