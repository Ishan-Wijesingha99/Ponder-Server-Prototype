// import dotenv so that you can store your secret key on your device and you're device only (server)
require('dotenv').config()

const { UserInputError } = require('apollo-server')

const { validateRegisterInput, validateLoginInput } = require('../../utils/validators')


const User = require('../../models/User')



const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')



const generateToken = user => {
  return jwt.sign({
    id: user.id,
    email: user.email,
    username: user.username
  }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1h'})
}


module.exports = {

  Mutation: {
    // it goes (parent, args, context, info)
    // args is just the input you put into your typeDefs
    // register(registerInput: RegisterInput): User!
    // it's RegisterInput from above
    // we are going to destructure it straight away for ease
    register: async (parent, { registerInput: { username, email, password, confirmPassword }}, context, info) => {
      
      // validate form data, this is where we check if the username has already been taken, if the password and confirmPassword matches, if the email is the correct form using a Regex expression etc etc
      const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword)

      if(!valid) throw new UserInputError('Errors', { 
        fields: errors
      })



      // make sure user doesn't already exist
      const user = await User.findOne({ username })

      if(user) throw new UserInputError('Username is taken', {
        fields: {
          username: 'This username is taken'
        }
      })



      // hash password and create an authentication token
      hashedPassword = await bcrypt.hash(password, 12)

      // create new user on User model with the hashed password
      const newUser = new User({
        email,
        username,
        password: hashedPassword,
        createdAt: Date.now()
      })

      // save that new user to the database
      const res = await newUser.save()

      // create jwt token
      const token = generateToken(res)

      return {
        ...res._doc,
        id: res._id,
        token
      }
    },
    login: async (_, {email, password}) => {
      const { errors, valid } = validateLoginInput(email, password)

      // validate form data
      if(!valid) throw new UserInputError('Errors', {
        fields: errors 
      })

      

      // check if user exists
      const user = await User.findOne({ email })

      if(!user) {
        errors.general = 'User not found'
        throw new UserInputError('Email not found in our database', { 
          fields: errors 
        })
      }

      // after we first check if the exists in our database, we can then compare the password the user typed in to the password in the database
      const correctPassword = await bcrypt.compare(password, user.password)

      if(!correctPassword) {
        errors.general = 'Wrong password'
        throw new UserInputError('Wrong password', { 
          fields: errors 
        })
      }

      // if we get to this point in the code, the email and password are correct, and the user can be logged in
      const token = generateToken(user)

      return {
        ...user._doc,
        id: user._id,
        token
      }
    }




  }

}