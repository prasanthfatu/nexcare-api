const Notification = require('../model/Notification')

const getAllNotifications = async(req, res) => {

    const notifications = await Notification.find({})

    if(!notifications){
        res.status(400).json({message: 'No notifications found.'})
    }

    res.json(notifications)
}

const getNotification = async(req, res) => {
    const {notId} = req.params

    if(!notId) {
        return res.status(400).json({message: 'Notification ID is required.'})
    }
    
    // Check if the notification exists
    const notification = await Notification.findById(notId)

    if(!notification) {
        res.status(404).json({message: 'Notification Not Found'})
    }

    res.json(notification)

}

const updateNotification = async (req, res) => {

    try {

        const { notId } = req.params;
        
        if (!notId) {
            return res.status(400).json({ message: `Notification Id is required` });
        }

        // Check if the notification exists based on the appointment ID
        const notification = await Notification.findById(notId);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found.' });
        }

        // Update 'read' in the database
        notification.read = true;
        await notification.save();

        // Return the updated notification
        return res.json(notification);

    } catch (err) {

        console.error('Error updating notification:', err);
        return res.status(500).json({ message: 'An error occurred while updating notification.' });

    }
}

const deleteNotification = async(req, res) => {
    
    const {notId} = req.params

    if(!notId) return res.status(400).json({message: `notificationId is required`})

    //confirm notification is exists in database
    const notification = await Notification.findById(notId).exec()

    if(!notification){
        return res.status(400).json({message: `Notification not found`})
    }

    const result = await notification.deleteOne()
    const reply = `Notification ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllNotifications,
    updateNotification,
    deleteNotification,
    getNotification
}
