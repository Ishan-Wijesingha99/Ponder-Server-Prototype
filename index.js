const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');

const express = require('express')

const cors = require('cors')

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { MONGODB } = require('./config.js');


const PORT = process.env.port || 5000;

const myApp = express()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub })
});

server.applyMiddleware(cors())
server.applyMiddleware({ app: myApp })

mongoose
  .connect(MONGODB, { useNewUrlParser: true })
  .then(() => {
    console.log('MongoDB Connected');
    return server.listen({ port: PORT });
  })
  .then((res) => {
    console.log(`Server running at ${res.url}`);
  })
  .catch(err => {
    console.error(err)
  })
