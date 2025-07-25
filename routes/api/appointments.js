const express = require('express')
const router = express.Router()
const appointmentsController = require('../../controllers/appointmentsController')

router.route('/')
            .get(appointmentsController.getAllAppointments)
            .post(appointmentsController.createNewAppointment)
            .put(appointmentsController.updateAppointment)

router.route('/:appId')
            .get(appointmentsController.getAppointment)
            .delete(appointmentsController.deleteAppointment)   
                     
module.exports = router
