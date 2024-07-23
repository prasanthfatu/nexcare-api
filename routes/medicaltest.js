const express = require('express')
const router = express.Router()
const medicaltestController = require('../controllers/medicaltestController')

router.post('/', medicaltestController.handleMedicalTest)

module.exports = router