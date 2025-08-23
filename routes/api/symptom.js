const express = require("express")
const router = express.Router()
const symptomsController = require("../../controllers/symptomsController")

router.route('/')
            .post(symptomsController.checkSymptom)
            

module.exports = router            