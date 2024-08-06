const express = require('express');
const router = express.Router();
const notificationsController = require('../../controllers/notificationsController')

router.route('/')
        .get(notificationsController.getAllNotifications)    

router.route('/:notId')
        .get(notificationsController.getNotification)
        .put(notificationsController.updateNotification)    
        .delete(notificationsController.deleteNotification)    

module.exports = router;
