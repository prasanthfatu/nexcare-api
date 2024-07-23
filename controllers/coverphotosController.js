const Coverphoto = require('../model/CoverPhoto')

const createCoverPhoto = async(req, res) => {

    try {

        const result = await Coverphoto.findOneAndUpdate(
            { name: req.query.name},
            {
                name: req.query.name,
                coverPhoto: req.file.filename
            },
            { new: true, upsert: true}
        )

        res.status(201).json({'success' : `${req.query.name} your cover photo uploaded!`})

    } catch (err) {

        res.status(500).json({'message' : err.message})

    }
}

const getCoverPhoto = async(req, res) => {

    const {name} = req.query

    if(!name) {
        return res.status(400).json({message: 'name is required'})
    }

    try {

        const coverphoto = await Coverphoto.findOne({name: name}).exec()

        if(!coverphoto) {
            return res.status(204).json({message: 'coverphoto not found.'})
        }

        res.json(coverphoto)

    } catch (err) {

        res.status(500).json({message: err.message})

    }
}

module.exports = {
    getCoverPhoto,
    createCoverPhoto
}