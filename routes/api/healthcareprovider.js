const express = require('express')
const router = express.Router()
const ROLES_LIST = require('../../config/roles_list')
const verifyRoles = require('../../middleware/verifyRoles')
const healthcareproviderController = require('../../controllers/healthcareproviderController')

router.route('/')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.HealthcareProvider, ROLES_LIST.User, ROLES_LIST.Guest), healthcareproviderController.getHealthcareProvider)

module.exports = router    
