const Appointment = require('../model/Appointment')
const TIME_SLOTS = require('../config/time_slots')

const getAllAvailableTimes = async(req, res) => {
    const { doctor, dateKey } = req.body

    if (!doctor || !dateKey) {
        return res.status(400).json({ message: 'doctorId and date are required' });
    }
    try {
        const booked = await Appointment.find({doctor, date: dateKey})
        const bookedTimes = booked.map(a => a.time)        
        const availableTimes = TIME_SLOTS.filter(time => !bookedTimes.includes(time))
        res.json({availableTimes})
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

module.exports = { getAllAvailableTimes }