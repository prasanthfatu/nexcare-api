const express = require('express')
const router = express.Router()
const profileController = require('../../controllers/profilesController')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Function to delete all files in a directory
const deleteAllFiles = (directory) => {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const {name} = req.query;
    if (!name) {
      return cb(new Error('Name is required'), false);
    }

    const uploadPath = path.join(__dirname, '../../public/img', name);

    // Ensure the directory exists
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) {
        return cb(err, false);
      }
      deleteAllFiles(uploadPath);
      cb(null, uploadPath);
    });
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });
  
router.route('/')
    .post(upload.single('avatar'), profileController.createProfile)
    .get(profileController.getProfile)
    .delete(profileController.deleteProfile)

module.exports = router;