require("dotenv").config()

const { ApolloServer } = require('apollo-server')
const gql = require('graphql-tag') // installed with apollo-server npm package
// there is no need to install express because it comes installed with apollo-server npm package

const mongoose = require('mongoose')

const Post = require('./models/Post')

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const PORT = process.env.PORT || 5000


const server = new ApolloServer({ 
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req })
})

mongoose.connect('mongodb+srv://ishanwij99:yeet981@cluster0.6n9gpsy.mongodb.net/Ponder?retryWrites=true&w=majority',
{ useNewUrlParser: true })
.then(res => console.log('Mongoose connection successful'))
.then(() => server.listen({ port: PORT }).then(res => console.log(`Server is running at ${res.url}`)))
.catch(error => console.error(error))


