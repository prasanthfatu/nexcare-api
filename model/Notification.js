const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    recipient: { 
        type: String,
        required: true
    },
    content: { 
        type: String, 
        required: true
    },
    type: { 
        type: String, 
        enum: ['request', 'accept', 'deny', 'reminder', 'success'], 
        required: true
    },
    appointmentId: { 
        type: String, 
        required: true
     },
    read: { 
        type: Boolean, 
        default: false
    },
    newUser: {
        type: String
    },
    profileUpload: {
        type: String
    },
    createdAt: { 
        type: Date, 
        default: Date.now
    }
})

module.exports = mongoose.model('Notification', notificationSchema)