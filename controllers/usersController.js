const User = require('../model/User');
const Appointment = require('../model/Appointment')
const CoverPhoto = require('../model/CoverPhoto')
const Profile = require('../model/Profile')
const Notification = require('../model/Notification')
const path = require('path')
const fsPromises = require('fs').promises

const getuserbyName = async(req, res) => {

    const { user} = req.params

    if(!user) return res.status(400).json({message: `user is required.`})

    //get user from database
    const person = await User.findOne({username: user}).select('unseenNotification').lean().exec()

    if(!person){
        return res.status(204).json({message: `user ${person.username} not found.`})
    }

    res.json(person)

}

const getAllUsers = async (req, res) => {

    // Get all users from MongoDB
    const users = await User.find().select('-password').lean()

    // If no users 
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }

    res.json(users)

}

const updateUser = async(req, res) => {

    const {userId, username, roles} = req.body

    if(!userId || !username || !roles){
        return res.status(400).json({message: `All fields are required`})
    }

    //check user is exists in database
    const user = await User.findById(userId).exec()
    if(!user){
        return res.status(400).json({message: `User not found`})
    }

    //check duplicate username in database
    const duplicate = await User.findOne({username}).collation({locale: 'en', strength: 2}).lean().exec()

    //allow to rename the username
    if(duplicate && duplicate._id.toString() !== userId){
        return res.status(409).json({message: 'Duplicate username'})
    }
    user.username = username
    user.roles = roles
    const updatedUser = await user.save()
    res.json(`${updatedUser.username} is updated.`)

}

const deleteUser = async (req, res) => {

    const {userId} = req.params

    if(!userId) return res.status(400).json({message: `userId is required`})

    //confirm user is exists in database
    const user = await User.findById(userId).exec()

    if(!user){
        return res.status(400).json({message: `User not found`})
    }

    console.log(user)

    //check appointment if exists
    const appointments = await Appointment.find({patientName: user.username}).lean().exec()

    if(appointments.length > 0){
        for(let appointment of appointments){
            await Appointment.deleteOne({_id: appointment._id})
        }
    }

    //delete coverPhoto if exist
    const CoverPhotoDelete = async(coverImage, coverName) => {

        try {
    
            const imagePath = path.join(__dirname, `../public/coverPhoto/${coverName}`, coverImage);
            const profileDirPath = path.join(__dirname, `../public/coverPhoto/${coverName}`)

            //Delete the cover image
            await fsPromises.unlink(imagePath)

            //Delete the coverphoto directory if it is empty
            const files = await fsPromises.readdir(profileDirPath)
            if(files.length === 0){
                await fsPromises.rmdir(profileDirPath)
            }
    
          } catch (error) {
    
            console.error('there was an error:', error.message);
    
        }  
    }

    const coverphotos = await CoverPhoto.find({name: user.username}).lean().exec()

    if(coverphotos.length > 0){
        for(let coverphoto of coverphotos) {
            await CoverPhotoDelete(coverphoto.coverPhoto, coverphoto.name)
            await CoverPhoto.deleteOne({_id: coverphoto._id})
        }
    }

    //delete profile if exist
    const profilePhoto = async(profileImage, profileName) => {

        try {
    
            const imagePath = path.join(__dirname, `../public/img/${profileName}`, profileImage);
            const coverphotoDirPath = path.join(__dirname, `../public/img/${profileName}`)
            
            //Delete tht cover photo
            await fsPromises.unlink(imagePath)

            //Delete coverphoto directory if it is empty
            const files = await fsPromises.readdir(coverphotoDirPath)
            if(files.length === 0){
                await fsPromises.rmdir(coverphotoDirPath)
            }
    
          } catch (error) {
    
            console.error('there was an error:', error.message);
    
        }  
    }

    const prophotos = await Profile.find({name: user.username}).lean().exec()

    if(prophotos.length > 0){
        for(let prophoto of prophotos){
            await profilePhoto(prophoto.image, prophoto.name)
            await Profile.deleteOne({_id: prophoto._id})
        }
    }

    //delete notifications if exist
    const usernotify = await Notification.find({recipient: user.username}).lean().exec()

    if(usernotify.length > 0){
        for(let notify of usernotify) {
            await Notification.deleteOne({_id: notify._id})
        }
    }

    //Delete the user
    const result = await user.deleteOne()
    const reply = `User ${result.username} with ${result._id} deleted`

    res.json(reply)

}

const getUser = async (req, res) => {

    const { userId } = req.params

    if(!userId) return res.status(400).json({message: `userId is required.`})

    //get user from database
    const user = await User.findById(userId).select('-password').lean().exec()

    if(!user){
        return res.status(204).json({message: `userId ${userId} not found.`})
    }

    res.json(user)
  
}

module.exports = {
    getAllUsers,
    deleteUser,
    getUser,
    updateUser,
    getuserbyName,
}