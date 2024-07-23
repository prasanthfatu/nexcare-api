const User = require('../model/User')
const ROLES_LIST = require('../config/roles_list')

const getHealthcareProvider = async(req, res) => {

    try{

        const healthcareProvider = await User.find({roles: ROLES_LIST.HealthcareProvider}).select('-password -createdAt -updatedAt -refreshToken').lean().exec()

        if(!healthcareProvider || healthcareProvider.length === 0){
            return res.status(204).json({message: 'HealthcareProvider Not Found.'})
        }

        res.json(healthcareProvider)

    } catch(err) {

        console.error(err)
        res.status(500).json({message: 'Server Error'})

    }

}

module.exports = {
    getHealthcareProvider
}
