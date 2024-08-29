const Appointment = require('../model/Appointment')
const moment = require('moment-timezone')

const checkTimeAvailability = async (req, res, next) => {
    const { patientName, test, doctor, date, sTime, eTime } = req.body;

    if (!patientName || !test || !doctor || !date || !sTime || !eTime) {
        return res.status(400).json({ message: 'All Fields Are Required' });
    }

    // Parsing and formatting the dates and times
    const selectedDate = moment.tz(date, 'YYYY-MM-DD', 'Asia/Kolkata').format('YYYY-MM-DD');
    const currentDate = moment.tz('Asia/Kolkata').format('YYYY-MM-DD');

    const start = moment.tz(`${selectedDate}T${sTime}`, 'Asia/Kolkata').format('YYYY-MM-DDTHH:mm');
    const end = moment.tz(`${selectedDate}T${eTime}`, 'Asia/Kolkata').format('YYYY-MM-DDTHH:mm');
    
    const currentDateTime = moment.tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm');

    function isDateTimeExpired(dateTime) {
        return moment.tz(dateTime, 'Asia/Kolkata').isBefore(currentDateTime);
    }

    // Check if the selected date is before the current date
    if (moment(selectedDate).isBefore(currentDate)) {
        return res.status(400).json({ message: 'Appointment date has already passed' });
    }

    // Check if the selected times are within the allowed range (08:00 to 17:00)
    if (
        !moment(sTime, 'HH:mm').isBetween(moment('08:00', 'HH:mm'), moment('17:00', 'HH:mm'), null, '[]') ||
        !moment(eTime, 'HH:mm').isBetween(moment('08:00', 'HH:mm'), moment('17:00', 'HH:mm'), null, '[]')
    ) {
        return res.status(400).json({ message: 'Please choose a time between 8 AM and 5 PM.' });
    }

    // Check if start and end times are valid
    if (start === end || start > end) {
        return res.status(400).json({ message: 'Enter Valid Time.' });
    }

    // Check if the given time has already expired
    if (isDateTimeExpired(start) || isDateTimeExpired(end)) {
        return res.status(400).json({ message: 'The given time has already expired.' });
    }

    // Retrieve all appointments
     const appointments = await Appointment.find({});

    const filteredAppointment =  appointments.filter(appointment => {
        return appointment.doctor === doctor
    })
    
    const existingAppointment = filteredAppointment.map(appointment => {
        return {startTime: appointment.startTime, endTime: appointment.endTime}
    });
    
    // Check for overlapping appointments
    for (const appointment of appointments) {
        
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

module.exports = checkTimeAvailability;
