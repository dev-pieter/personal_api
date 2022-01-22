const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

const secret = process.env.TOKEN_SECRET;
const salt = process.env.SALT;

//Auth token verification
const authenticateToken = (token) => {
    if (token == null) return false
    try {
        return jwt.verify(token, secret)
    } catch {
        return false
    }

};

//Hash password before adding to database
const hashpassword = (password) => {
    var hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
    return hash
}

//See if password matches hash (Login)
const validatepassword = (hashedpass, pass) => {
    var newHash = crypto.pbkdf2Sync(pass, salt, 1000, 64, `sha512`).toString(`hex`);
    return hashedpass === newHash
}

module.exports = { authenticateToken, hashpassword, validatepassword }