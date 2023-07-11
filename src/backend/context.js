const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const context = {
  prisma: prisma,
  req: ({ req }) => ({ req })
}

module.exports = {
  context: context,
}
