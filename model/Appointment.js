const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },
    test: {
        type: String,
        required: true
    },
    doctor: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        requied: true
    }, 
    endTime: {
        type:String,
        require: true
    },
    status: {
        type: String,
        enum: ['pending', 'accept', 'deny'],
        default: 'pending',
      },
    notificationId: {
        type: String
    } 
})

module.exports = mongoose.model('Appointment', appointmentSchema)