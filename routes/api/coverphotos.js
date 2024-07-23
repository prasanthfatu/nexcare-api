const express = require('express')
const router = express.Router()
const coverphotosController = require('../../controllers/coverphotosController')
const path = require('path')
const fs = require('fs')
const multer = require('multer')

// Function to delete all files in a directory
const deleteExistFiles = (directory) => {
    fs.readdir(directory, (err, files) => {
        if(err) throw err;
        for(const file of files) {
            fs.unlink(path.join(directory, file), (err) => {
                if(err) throw err;
            })
        }
    })
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const {name} = req.query;
        if(!name) {
            return cb(new Error('Name is required'), false)
        }

        const uploadPath = path.join(__dirname, '../../public/coverPhoto', name)

        //Check directory exists
        fs.mkdir(uploadPath, {recursive: true}, (err) => {
            if(err) {
                return cb(err, false)
            }
            deleteExistFiles(uploadPath)
            cb(null, uploadPath)
        })
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`)
    }
  })
  
  const upload = multer({ storage: storage })

  router.route('/')
            .post(upload.single('cover'), coverphotosController.createCoverPhoto)
            .get(coverphotosController.getCoverPhoto)

  module.exports = router;         