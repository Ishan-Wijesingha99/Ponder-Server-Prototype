// import dotenv so that you can store your secret key on your device and you're device only (server)
require('dotenv').config()

const jwt = require('jsonwebtoken')

const { AuthenticationError } = require('apollo-server')



module.exports = context => {
  const authHeader = context.req.headers.authorization

  // if authHeader does not exist, throw an error
  if(!authHeader) throw new Error('Authorization header must be provided')

  // if you reach this line of code, authHeader does exist
  const token = authHeader.split('Bearer ')[1]

  // if token does not exist, throw an error
  if(!token) throw new Error("Authentication token must be in the form - 'Bearer [token]'")

  // if you reach this line of code, token exists
  try {
    const user = jwt.verify(token, process.env.TOKEN_SECRET_KEY)
    return user
  } catch (error) {
    console.log(error)
    throw new AuthenticationError('Invalid/Expired token')
  }

}