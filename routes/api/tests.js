const express = require('express')
const router = express.Router()
const patientsController = require('../../controllers/patientsController')

router.route('/')
            .get(patientsController.getallPatients)
            .put(patientsController.updatePatient)
            
router.route('/:patientId')
            .get(patientsController.getPatient)
            .delete(patientsController.deletePatient)

module.exports = router
