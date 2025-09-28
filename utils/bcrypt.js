const bcrypt = require("bcrypt")

const SALT = 10

const generatePasswordHash=(password)=>{
    return bcrypt.hash(password,SALT)
}

const comparePasswordHash = (password,passwordHashed)=>{
    return bcrypt.compare(password,passwordHashed)
}

module.exports = {
    generatePasswordHash,
    comparePasswordHash
}