const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },

    roles: {
        type: [String],
        default: ["User"]
    },

    password: {
        type: String,
        required: true
    },

    department: {
        type: String
    },

    tests: {
        type: [String]
    },

    refreshToken: String,

    profileImage: String,

},
    {
        timestamps: true
    }
    
);

module.exports = mongoose.model('User', userSchema);