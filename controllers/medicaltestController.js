const Test = require('../model/Test')

const handleMedicalTest = async(req, res) => {

    const {patientName, age, gender, address, email, phone, maritalStatus, fullname, relationship, emerPhone} = req.body

    if(!patientName || !age || !gender || !address || !email || !phone || !maritalStatus || !fullname || !relationship || !emerPhone) {
        return res.status(400).json({'message': 'All Fields Are Required'})
    }

    //check duplicate patientname in db
    const duplicate = await Test.findOne({patientName}).collation({locale: 'en', strength: 2}).lean().exec()

    if(duplicate) return res.status(409).json({message: 'Username Taken'})//conflict

    //create and store new patient
    const patient = await Test.create({patientName, age, gender, address, email, phone, maritalStatus, fullname, relationship, emerPhone})

    if(patient){ //created new patient
        return res.status(201).json({message : `${patient.patientName} personal information added successfully!`})
    }else {
        res.status(400).json({message: 'Invalid patient data received.'})
    }
}

module.exports = { 
    handleMedicalTest
}
