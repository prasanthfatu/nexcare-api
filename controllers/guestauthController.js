const User = require('../model/User');
const jwt = require('jsonwebtoken');

const handleGuest = async (req, res) => {
    const { user } = req.body;

    if (!user) return res.status(400).json({ 'message': 'Username is required.' });

    
    // Find the user
    const foundUser = await User.findOne({ username: user }).exec();
    
    if (!foundUser) return res.sendStatus(401); //Unauthorized 


    if(foundUser) {
        // Create JWTs
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                    "roles": foundUser.roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '5m' }
        );

        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        // Save refreshToken with current user
        foundUser.refreshToken = refreshToken;
        await foundUser.save();

          // Creates Secure Cookie with refresh token
          res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

          // Send authorization roles and access token to user
          res.json({ accessToken });

    } else {
        res.sendStatus(401);
    }
}

module.exports = { handleGuest };
