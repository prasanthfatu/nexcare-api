const express = require("express")
const router = express.Router()
const recommendDepartmentController = require("../../controllers/recommendDepartmentController")

router.route('/')
            .post(recommendDepartmentController.testDepartment)
            

module.exports = router            