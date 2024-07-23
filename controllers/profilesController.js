const Profile = require('../model/Profile')
const Notification = require('../model/Notification')
const fsPromises = require('fs').promises;
const path = require('path')

const createProfile = async(req, res) => {

    try {
        const result = await Profile.findOneAndUpdate(
            { name: req.body.name },
            {   name : req.body.name,
                image: req.file.filename },
            { new: true, upsert: true }
          );

        // Create a notification for the user
         const notification = new Notification({
            recipient: req.body.name,
            content: 'Your profile has uploaded!',
            type: 'success',
            appointmentId: req.body.name,
            profileUpload: 'Uploaded'
        });

        // Save the notification to the database
        await notification.save();

        res.status(201).json({ 'success': `${req.body.name} your profile uploaded!` });

    } catch (err) {

        res.status(500).json({ 'message': err.message });

    }
};

const getProfile = async (req, res) => {

    const {name} = req.query

    if(!name) return res.status(400).json({message: `name is required.`})

    try {

        const profile = await Profile.findOne({name: name}).exec()

        if(!profile){
            return res.status(204).json({message: `profile not found.`})
        }

        res.json(profile)

    } catch (err) {

        res.status(500).json({ 'message': err.message });

    }
}

const imageDelete = async(profileImage, profileName) => {

    try {

        await fsPromises.unlink(path.join(__dirname, `../public/img/${profileName}`, profileImage));

      } catch (error) {

        console.error('there was an error:', error.message);

    }  
}

const deleteProfile = async (req, res) => {

    const {profileId, name} = req.query
    
    if(!profileId) return res.status(400).json({message: `profileId is required`})

    //confirm profile is exists in database
    const profile = await Profile.findById(profileId).exec()

    if(!profile){
        return res.status(400).json({message: `Profile not found`})
    }

    imageDelete(profile.image, profile.name)

    const result = await profile.deleteOne()
    const reply = `Profile ${result._id} deleted`

    res.json(reply)
    
}

module.exports = {
    createProfile,
    getProfile,
    deleteProfile
}