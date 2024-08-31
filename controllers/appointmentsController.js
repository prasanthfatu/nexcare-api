const Appointment = require('../model/Appointment')
const User = require('../model/User')
const Notification = require('../model/Notification')
const moment = require('moment-timezone')

const getAllAppointments = async(req, res) => {

    const appointments = await Appointment.find({})

    if(!appointments){
        return res.status(400).json({message: 'No Appointments found.'})
    }

    res.json(appointments)
}

const createNewAppointment = async(req, res) =>{

    const {patientName, test, doctor, date, sTime, eTime} = req.body

    if(!patientName || !test || !doctor || !date || !sTime || !eTime){
        return res.status(400).json({message: 'All Fields Are Required'})
    }

     // Check if doctor is provided and exists
     let doc;
     try {
        doc = await User.findOne({username: doctor}).exec()
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
     } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error finding doctor' });        
     }

    //create new appointment
    try {
        const selectedDate = moment.tz(date, 'Asia/Kolkata');
        
        const startTime = moment.tz(`${selectedDate.format('YYYY-MM-DD')}T${sTime}`, 'Asia/Kolkata');
        const endTime = moment.tz(`${selectedDate.format('YYYY-MM-DD')}T${eTime}`, 'Asia/Kolkata');
        
        const appointment = await Appointment.create({patientName, test, doctor, date, startTime, endTime})

        // Create a notification for the doctor
        const notification = new Notification({
            recipient: doctor,
            content: 'New appointment request',
            type: 'request',
            appointmentId: appointment._id
        });

        // Save the notification to the database
        await notification.save();
    
        //add notification Id to appointment
        appointment.notificationId = notification._id 
        const result = await appointment.save()        

        res.status(201).json(appointment)

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

const updateAppointment = async (req, res) => {

    try {
        const { id, status } = req.body
       
        if (!id) {
            return res.status(400).json({ message: `AppointmentId is required` })
        }

        if (!status) {
            return res.status(400).json({ message: `Status is required` });
        }

        const appointment = await Appointment.findById(id);
        
        if (!appointment) {
            res.status(400).json({ message: `No appointment found` })
        }
        appointment.status = status
        const result = await appointment.save()

        // Create a notification for the user
        const notification = await Notification.create({
                recipient: appointment.patientName,
                content: (status === "accept") ? `${appointment.patientName} your appointment is confirmed!` : (status === "deny") ? `${appointment.patientName} your appointment is denied!` : undefined,
                type: status,
                appointmentId: appointment._id
        })
        
        // Save the notification to the database
        await notification.save()

        return res.json({ message: `Appointment ${status} successfully.` })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while updating appointment.' });
    }
}

const getAppointment = async (req, res) => {

    const { appId } = req.params;

    if (!appId) {
        return res.status(400).json({ message: 'Appointment ID is required.' });
    }

    try {
        // Check if appointment exists in the database
        const appointment = await Appointment.findById(appId).lean().exec();

        if (!appointment) {
            return res.status(404).json({ message: `Appointment not found.` });
        }

        return res.json(appointment);
    } catch (error) {
        // Handle database errors or other unexpected errors
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};


const deleteAppointment = async(req, res) => {

    const {appId} = req.params
    
    if(!appId) return res.status(400).json({message: `appointmentId is required`})

    //confirm appointment is exists in database
    const appointment = await Appointment.findById(appId).exec()

    if(!appointment){
        return res.status(400).json({message: `Appointment not found`})
    }

    //delete notification is exists in database
    const notificationDel = await Notification.find({appointmentId: appointment._id}).exec()
    if(notificationDel){
        for(const notification of notificationDel){
        const delNotify = await notification.deleteOne()
        }
    }
    const result = await appointment.deleteOne()
    const reply = `Appointment ${result.patientName} with ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllAppointments,
    createNewAppointment,
    updateAppointment,
    getAppointment,
    deleteAppointment
}
