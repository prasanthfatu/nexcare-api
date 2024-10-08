const Appointment = require('../model/Appointment');
const moment = require('moment-timezone');

const checkTimeAvailability = async (req, res, next) => {
    const { patientName, test, doctor, date, sTime, eTime } = req.body;

    if (!patientName || !test || !doctor || !date || !sTime || !eTime) {
        return res.status(400).json({ message: 'All Fields Are Required' });
    }

    // Parse and format the dates and times
    const selectedDate = moment.tz(date, 'Asia/Kolkata');
    const currentDate = moment.tz('Asia/Kolkata');

    const start = moment.tz(`${selectedDate.format('YYYY-MM-DD')}T${sTime}`, 'Asia/Kolkata');
    const end = moment.tz(`${selectedDate.format('YYYY-MM-DD')}T${eTime}`, 'Asia/Kolkata');
    const currentDateTime = moment.tz('Asia/Kolkata');

    function isDateTimeExpired(dateTime) {
        return moment.tz(dateTime, 'Asia/Kolkata').isBefore(currentDateTime);
    }

    // Check if the selected date is before the current date
    if (selectedDate.isBefore(currentDate, 'day')) {
        return res.status(400).json({ message: 'Appointment date has already passed' });
    }

    // Check if the selected times are within the allowed range (08:00 to 17:00)
    const startTimeValid = start.isBetween(moment.tz(`${selectedDate.format('YYYY-MM-DD')}T08:00`, 'Asia/Kolkata'), moment.tz(`${selectedDate.format('YYYY-MM-DD')}T17:00`, 'Asia/Kolkata'), null, '[]');
    const endTimeValid = end.isBetween(moment.tz(`${selectedDate.format('YYYY-MM-DD')}T08:00`, 'Asia/Kolkata'), moment.tz(`${selectedDate.format('YYYY-MM-DD')}T17:00`, 'Asia/Kolkata'), null, '[]');

    if (!startTimeValid || !endTimeValid) {
        return res.status(400).json({ message: 'Please choose a time between 8 AM and 5 PM.' });
    }

    // Check if start and end times are valid
    if (start.isSameOrAfter(end)) {
        return res.status(400).json({ message: 'Enter valid time.' });
    }

    // Check if the given time has already expired
    if (isDateTimeExpired(start) || isDateTimeExpired(end)) {
        return res.status(400).json({ message: 'The given time has already expired.' });
    }
    // Retrieve all appointments
    let appointments
    try {
        appointments = await Appointment.find({});

        if (appointments.length === 0) {
            return next();
        }
            
            const filteredAppointment =  appointments.filter(appointment => {
                return appointment.doctor === doctor
            })
                    
            const existingAppointment = filteredAppointment.map(appointment => (
                 {startTime: appointment.startTime, endTime: appointment.endTime}
            ));
                
            // Check for overlapping appointments
            for (const appointment of existingAppointment) {
                
                const appointmentStart = appointment.startTime;
                const appointmentEnd = appointment.endTime;

                if (
                    (start.isBefore(appointmentEnd) && end.isAfter(appointmentStart)) || // Overlaps with existing appointment
                    (start.isSameOrBefore(appointmentStart) && end.isSameOrAfter(appointmentEnd)) // Completely within existing appointment
                ) {
                    return res.status(409).json({ message: `Requested Time ${sTime} - ${eTime} is not available. Please choose a different time.` });
                }
    
            }

            // If no overlapping appointments found, proceed to the next middleware
            next();
    
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
};

module.exports = checkTimeAvailability;
