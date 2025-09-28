const jwt = require('jsonwebtoken');

const generateAccessToken = (userId) => {

    return jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1y"
    });

}


const verifyAccessToken = (accessToken) => {

    if (!accessToken) return false

    const tokenValid = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    if (!tokenValid) return false

    return tokenValid._id

}

module.exports = {
    generateAccessToken,
    verifyAccessToken
}