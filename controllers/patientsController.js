const Test = require('../model/Test')

const getallPatients = async(req, res) => {

    const patients = await Test.find({})

    if(!patients?.length){
        return res.status(400).json({'message': 'No patients found'})
    }

    res.json(patients)
}

const getPatient = async(req, res) => {

    const {patientId} = req.params

    if(!req?.params?.patientId) return res.status(400).json({'message': 'Patient ID required.'})
        const patient = await Test.findById(patientId).exec();

    if(!patient){
        return res.status(204).json({'message': `No patient matches Id ${req.params.patientId}`})
    }

    res.json(patient)

}

const updatePatient = async(req, res) => {

    const {patientId, patientName, age, gender, address, email, phone, maritalStatus, fullname, relationship, emerPhone} = req.body

    if(!patientName || !age || !gender || !maritalStatus || !address || !email || !phone || !patientId || !fullname || !relationship || !emerPhone){
        return res.status(400).json({message: 'All fields are required.'})
    }

    //confirm patient exists to update
    const patient = await Test.findById(patientId).exec()

    if(!patient){
        return res.status(400).json({message: 'Patient not found.'})
    }

    //check for duplicate patientName
    const duplicate = await Test.findOne({patientName}).collation({locale: 'en', strength: 2}).lean().exec()

    //allow renaming of the patientName
    if(duplicate && duplicate._id.toString() !== patientId){
        return res.status(409).json({message: 'Duplicate Patient Name'})
    }

    patient.patientName = patientName
    patient.age = age
    patient.gender = gender
    patient.maritalStatus = maritalStatus
    patient.address = address
    patient.email = email
    patient.phone = phone
    patient.fullname = fullname
    patient.relationship = relationship
    patient.emerPhone = emerPhone
    
    const updatedPatient = await patient.save()

    res.json(`'${updatedPatient.patientName}' is updated.`)
}  

const deletePatient = async(req, res) => {

    const {patientId} = req.params

    if(!patientId){
        return res.status(400).json({message: 'patientId is required'})
    }
    
    //confirm patient exist to delete
    const patient = await Test.findById(patientId).exec()
    if(!patient){
        return res.status(400).json({message: 'Patient not found.'})
    }

    const result = await patient.deleteOne()
    const reply = `Patient ${result.patientName} with ${result._id} deleted`
    res.json(reply)

}

module.exports = {
    getallPatients,
    getPatient,
    updatePatient,
    deletePatient
}