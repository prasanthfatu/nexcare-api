const express = require('express')
const router = express.Router()
const availabletimeController = require('../../controllers/availabletimeController')

router.route('/')
            .post(availabletimeController.getAllAvailableTimes)

module.exports = router            

