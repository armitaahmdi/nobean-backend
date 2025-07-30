const jwt = require("jsonwebtoken")

const secretKey = 'sldkjfsjdsjdfljsdj'

module.exports.generateToken = (userId) => {
    return  jwt.sign({id:userId}, secretKey , { expiresIn: "7d" })
}

module.exports.verifyToken = (token) => {
return jwt.verify(token , secretKey)

}