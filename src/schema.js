const {
    intArg,
    makeSchema,
    nonNull,
    objectType,
    stringArg,
    inputObjectType,
    arg,
    asNexusMethod,
    enumType,
} = require('nexus')

const { DateTimeResolver } = require('graphql-scalars')

const DateTime = asNexusMethod(DateTimeResolver, 'date')


// mutation
const Mutation = objectType({
    name: 'Mutation',
    definition(t) {
        t.nonNull.field('createUser', {
            type: 'User',
            args: {
                data: nonNull(
                    arg({
                        type: 'UserCreateInput',
                    }),
                ),
            },
            resolve: async (_, args, ctx) => {
                const { data } = args
                const user = await ctx.prisma.user.create({
                    data: {
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        role: data.role,
                        company: data.company,
                    },
                })
                return user
            }
        })
    }
})
const User = objectType({
    name: 'User',
    definition(t) {
        t.nonNull.int('id')
        t.string('name')
        t.nonNull.string('email')
        t.string('password')
        t.string('role')
        t.string('company')
        t.nonNull.list.nonNull.field('createdEvents', {
            type: 'Event',
            resolve: (parent, _, context) => {
                return context.prisma.user
                    .findUnique({
                        where: { id: parent.id || undefined },
                    })
                    .events()
            },
        })
        t.nonNull.list.nonNull.field('bookedEvents', {
            type: 'Event',
            resolve: (parent, _, context) => {
                return context.prisma.user
                    .findUnique({
                        where: { id: parent.id || undefined },
                    })
                    .events()
            },
        })
    },
})

const Event = objectType({
    name: 'Event',
    definition(t) {
        t.nonNull.int('id')
        t.nonNull.string('title')
        t.nonNull.string('description')
        t.nonNull.string('imageUrl')
        t.nonNull.string('date')
        t.nonNull.string('places')
        t.nonNull.int('price')
        t.nonNull.int('tickets')
        t.nonNull.list.nonNull.field('creator', {
            type: 'User',
            resolve: (parent, _, context) => {
                return context.prisma.events
                    .findUnique({
                        where: { id: parent.id || undefined },
                    })
                    .user()
            },
        })
        t.nonNull.list.nonNull.field('user', {
            type: 'User',
            resolve: (parent, _, context) => {
                return context.prisma.events
                    .findUnique({
                        where: { id: parent.id || undefined },
                    })
                    .user()
            },
        })
    }
})


const UserCreateInput = inputObjectType({
    name: 'UserCreateInput',
    definition(t) {
        t.string('name')
        t.nonNull.string('email')
        t.nonNull.string('password')
        t.nonNull.string('role')
        t.nonNull.string('company')
    },
})

// make schema
const schema = makeSchema({
    types: [
        Mutation,
        User,
        Event,
        UserCreateInput,
        DateTime,
    ],
    outputs: {
        schema: __dirname + '/../schema.graphql',
        typegen: __dirname + '/generated/nexus.ts',
    },
    sourceTypes: {
        modules: [
            {
                module: '@prisma/client',
                alias: 'prisma',
            },
        ],
    },
})

module.exports = {
    schema: schema,
}