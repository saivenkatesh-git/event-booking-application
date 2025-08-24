import prisma from "../lib/prisma"

export const resolvers = {
    Query:{
        events:()=>{
            return prisma.event.findMany()
        }
    }
}