const express = require('express')
const router = express.Router()
const appointmentsController = require('../../controllers/appointmentsController')
const checkTimeAvailability = require('../../middleware/checkTimeAvailability')

router.route('/')
            .get(appointmentsController.getAllAppointments)
            .post(checkTimeAvailability, appointmentsController.createNewAppointment)
            .put(appointmentsController.updateAppointment)

router.route('/:appId')
            .get(appointmentsController.getAppointment)
            .delete(appointmentsController.deleteAppointment)   
                     
module.exports = router
