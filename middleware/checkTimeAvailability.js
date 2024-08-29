const Appointment = require('../model/Appointment')
const indianTimeZone = require('moment-timezone')

const checkTimeAvailability = async (req, res, next) => {
    const { patientName, test, doctor, date, sTime, eTime } = req.body;
        
    if (!patientName || !test || !doctor || !date || !sTime || !eTime) {
        return res.status(400).json({ message: 'All Fields Are Required' });
    }

    const selectedDate = indianTimeZone(date).tz('Asia/Kolkata').format('YYYY-MM-DD')
    const currentDate = indianTimeZone().tz('Asia/Kolkata').format('YYYY-MM-DD')

    const start = indianTimeZone(`${selectedDate}T${sTime}`).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm')
    
    const end = indianTimeZone(`${selectedDate}T${eTime}`).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm')

    const currentDateTime = indianTimeZone().tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm')
    
    function isDateTimeExpired(dateTime) {        
        return indianTimeZone(dateTime).isBefore(currentDateTime);
    }

    if (selectedDate < currentDate) {
        return res.status(400).json({ message: 'Appointment date has already passed' });
    }

    if (!indianTimeZone(sTime, 'HH:mm').isBetween(indianTimeZone('08:00', 'HH:mm'), indianTimeZone('17:00', 'HH:mm'), null, '[]') ||
    !indianTimeZone(eTime, 'HH:mm').isBetween(indianTimeZone('08:00', 'HH:mm'), indianTimeZone('17:00', 'HH:mm'), null, '[]')) {
        return res.status(400).json({ message: 'Please choose a time between 8 AM and 5 PM.' });
    }

    if(start === end|| start > end){
        return res.status(400).json({ message: 'Enter Valid Time.' });
    }

    if (isDateTimeExpired(start) || isDateTimeExpired(end)) {
        return res.status(400).json({ message: 'The given time has already expired.' });
    }

    const appointments = await Appointment.find({});

    const filteredAppointment =  appointments.filter(appointment => {
        return appointment.doctor === doctor
    })

    const existingAppointment = filteredAppointment.map(appointment => {
        return {startTime: appointment.startTime, endTime: appointment.endTime}
    });

        for (const appointment of existingAppointment) {
            
            const appointmentStart = appointment.startTime
            const appointmentEnd = appointment.endTime
            
            // Check if the appointment overlaps with the given datetime range
            if (
                (start >= appointmentStart && start < appointmentEnd) ||
                (end > appointmentStart && end <= appointmentEnd) ||
                (start <= appointmentStart && end >= appointmentEnd)
            ) {
                return res.status(409).json({ message: `Requested Time ${sTime} - ${eTime} is not available. Please choose a different time.` });
            }
        }
    
        // If no overlapping appointments found, call next middleware or route handler
        next();
};

module.exports = checkTimeAvailability
