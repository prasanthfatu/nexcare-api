const User = require('../model/User');
const bcrypt = require('bcrypt');
const Notification = require('../model/Notification')

const handleNewUser = async (req, res) => {

    const { user, pwd } = req.body;

    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });

    // check for duplicate usernames in the db
    const duplicate = await User.findOne({ username: user }).collation({locale: 'en', strength: 2}).lean().exec();
    if (duplicate) return res.sendStatus(409); //Conflict 

    try {

        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);

        //create and store the new user
        const result = await User.create({
            "username": user,
            "password": hashedPwd
        });

         // Create a notification for the user
         const notification = new Notification({
            recipient: user,
            content: 'Your account is now activated!',
            type: 'success',
            appointmentId: user,
            newUser: 'Registered'
        });

        // Save the notification to the database
        await notification.save();

        res.status(201).json({ 'success': `New user ${user} created!` });

    } catch (err) {

        res.status(500).json({ 'message': err.message });

    }
    
}

module.exports = { handleNewUser };