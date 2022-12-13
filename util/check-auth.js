const { AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')
const { SECRET_KEY } = require('../config')



const checkAuth = async context => {
  
  const authHeader = context.req.headers.authorization

  // if authHeader does not exist, throw an error
  if(!authHeader) throw new Error('Authorization header must be provided')

  // if you reach this line of code, authHeader does exist
  const token = authHeader.split('Bearer ')[1]

  // if token does not exist, throw an error
  if(!token) throw new Error("Authentication token must be 'Bearer [token]")

  // if you reach this line of code, token exists
  try {
    const user = jwt.verify(token, SECRET_KEY)

    return user
  } catch (err) {
    throw new AuthenticationError('Invalid/Expired token')
  } 
}

module.exports = checkAuth
