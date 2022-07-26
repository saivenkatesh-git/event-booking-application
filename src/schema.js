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
                const createdEventData = args.data.createdEvents
                    ? args.data.createdEvents.map((event) => {
                        return { title: event.title, description: event.description || undefined }
                    })
                    : []
                const bookedEventData = args.data.bookedEvents
                    ? args.data.bookedEvents.map((event) => {
                        return { title: event.title, description: event.description || undefined }
                    })
                    : []
                const { data } = args
                const user = await ctx.prisma.user.create({
                    data: {
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        role: data.role,
                        company: data.company,
                        createdEvents: {
                            create: createdEventData,
                        },
                        bookedEvents: {
                            create: bookedEventData,
                        },
                    }
                })
                return user
            }
        })
        t.nonNull.field("createEvent", {
            type: "Event",
            args: {
                data: nonNull(
                    arg({
                        type: "EventCreateInput",
                    }),
                ),
                creatorEmail: nonNull(stringArg({})),
            },
            resolve: async (_, args, context) => {
                const { data } = args
                try {
                    isCreator = await context.prisma.user && context.prisma.user.findUnique(

                        {
                            email: args.creatorEmail,
                            role: "ADMIN"
                        })
                } catch (e) {
                    // if (e instanceof Prisma.PrismaClientKnownRequestError) {
                    //     // The .code property can be accessed in a type-safe manner
                    //     if (e.code === 'P2002') {
                    //         console.log(
                    //             'You are not authorized to create an event'
                    //         )
                    //     }
                    // }
                    throw e
                    const error = prismaCustomErrorHandler(e);
                    return error
                }

                if (!isCreator) {
                    console.log("not creator")
                    //  throw new Error('You are not authorized to create an event')
                     return null
                }
                else return context.prisma.event.create({
                    data: {
                        title: data.title,
                        description: data.description,
                        imageUrl: data.imageUrl,
                        date: data.date,
                        places: data.places,
                        price: data.price,
                        tickets: data.tickets,
                        creator: {
                            connect: { email: args.creatorEmail },
                        },
                    }
                })


            }
        })
    }
}
)

//  object types
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
                    .event()
            },
        })
        t.nonNull.list.nonNull.field('bookedEvents', {
            type: 'Event',
            resolve: (parent, _, context) => {
                return []
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
        t.nullable.string('imageUrl')
        t.nonNull.string('date')
        t.nonNull.string('places')
        t.nonNull.int('price')
        t.nonNull.int('tickets')
        t.field('creator', {
            type: 'User',
            resolve: (parent, _, context) => {
                return context.prisma.event
                    .findUnique({
                        where: { id: parent.id || undefined },
                    })
                    .creator()
            },
        })



        t.nonNull.list.nonNull.field('user', {
            type: 'User',
            resolve: (parent, _, context) => {
                return []
            },
        })
    }
})

// functionality
const UserCreateInput = inputObjectType({
    name: 'UserCreateInput',
    definition(t) {
        t.string('name')
        t.nonNull.string('email')
        t.nonNull.string('password')
        t.nonNull.string('role')
        t.string('company')
        t.list.nonNull.field('event', { type: 'EventCreateInput' })
    },
})

const EventCreateInput = inputObjectType({
    name: 'EventCreateInput',
    definition(t) {
        t.nonNull.string('title')
        t.nonNull.string('description')
        t.nullable.string('imageUrl')
        t.nonNull.string('date')
        t.nonNull.string('places')
        t.nonNull.int('price')
        t.nonNull.int('tickets')
        t.nonNull.string('creator')
    }
}
)


// make schema
const schema = makeSchema({
    types: [
        Mutation,
        User,
        Event,
        UserCreateInput,
        EventCreateInput,
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