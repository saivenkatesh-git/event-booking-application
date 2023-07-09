const { ApolloServer } = require('apollo-server')
const { schema } = require('./schema')
const { context } = require('./context')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const server = new ApolloServer({
  schema: schema,
  context:({ req }) => ({
    headers: req.headers, // Pass the request headers to the context
    prisma:prisma, // Pass the Prisma Client instance to the context
  }),
})

server.listen().then(async ({ url }) => {
  console.log(`\
🚀 Server ready at: ${url}
⭐️ See sample queries: http://pris.ly/e/js/graphql#using-the-graphql-api
  `)
})
