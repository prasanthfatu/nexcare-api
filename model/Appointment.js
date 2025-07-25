const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },
    doctor: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    notificationId: {
        type: String
    },
    test: {
        type: String,
        required: true
    },
    status:{
        type: String,
        enum: ['pending', 'accept', 'deny'],
        default: 'pending'
    }
}, {
    timestamps: true
})

//prevent double booking
appointmentSchema.index({doctor: 1, date: 1, time: 1}, {unique: true})

module.exports = mongoose.model('Appointment', appointmentSchema)