// pages/api/graphql.ts

import { createSchema, createYoga } from 'graphql-yoga'
import type { NextApiRequest, NextApiResponse } from 'next'
import { resolvers } from '../../backend/resolvers'
import { typeDefs } from '../../backend/schema'

console.log(typeDefs);
console.log(resolvers);
export default createYoga<{
  req: NextApiRequest
  res: NextApiResponse
}>({
  schema: createSchema({
    typeDefs,
    resolvers
  }),
  graphqlEndpoint: '/api/graphql'
})

export const config = {
  api: {
    bodyParser: false
  }
}