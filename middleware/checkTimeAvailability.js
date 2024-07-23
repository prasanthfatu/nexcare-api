const Appointment = require('../model/Appointment')
const moment = require('moment')

const checkTimeAvailability = async (req, res, next) => {
    const { patientName, test, doctor, date, sTime, eTime } = req.body;
    const date1 = moment(date).format()
   
    if (!patientName || !test || !doctor || !date || !sTime || !eTime) {
        return res.status(400).json({ message: 'All Fields Are Required' });
    }

    const selectedDate = moment(date).format('YYYY-MM-DD')
    const currentDate = moment().format('YYYY-MM-DD')

    const startDateTimeStr = `${selectedDate}T${sTime}`
    const startDateTime = moment(startDateTimeStr).format()

    const endDateTimeStr = `${selectedDate}T${eTime}`
    const endDateTime = moment(endDateTimeStr).format()

    const currentDateTime = moment()

    function isDateTimeExpired(dateTime) {
        return moment(dateTime).isBefore(currentDateTime);
    }

    if (selectedDate < currentDate) {
        return res.status(400).json({ message: 'Appointment date has already passed' });
    }

    if (isDateTimeExpired(startDateTime) || isDateTimeExpired(endDateTime)) {
        return res.status(400).json({ message: 'The given datetime has already expired.' });
    }

    if(startDateTime === endDateTime || startDateTime > endDateTime){
        return res.status(400).json({ message: 'Enter Valid Time.' });
    }

    if (!moment(sTime, 'HH:mm').isBetween(moment('08:00', 'HH:mm'), moment('17:00', 'HH:mm'), null, '[]') ||
        !moment(eTime, 'HH:mm').isBetween(moment('08:00', 'HH:mm'), moment('17:00', 'HH:mm'), null, '[]')) {
            return res.status(400).json({ message: 'Please choose a time between 8 AM and 5 PM.' });
    }

    const start = new Date(`${selectedDate}T${sTime}`)
    const end = new Date(`${selectedDate}T${eTime}`)

    const appointments = await Appointment.find({});

    const filteredDoctor =  appointments.filter(appointment => {
        return appointment.doctor === doctor
    })

    const existingAppointment = filteredDoctor.map(appointment => {
        return {startTime: appointment.startTime, endTime: appointment.endTime}
    });

        for (const appointment of existingAppointment) {
            const appointmentStart = new Date(appointment.startTime);
            const appointmentEnd = new Date(appointment.endTime);
           
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