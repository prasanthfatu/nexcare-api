const express = require('express')
const router = express.Router()
const guestauthController = require('../controllers/guestauthController')

router.post('/', guestauthController.handleGuest)

module.exports = router
