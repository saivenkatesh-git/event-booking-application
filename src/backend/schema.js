const { PrismaClient } = require('@prisma/client')
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
    nullable,
} = require('nexus')

const { DateTimeResolver } = require('graphql-scalars')
const jwt = require("jsonwebtoken")
const DateTime = asNexusMethod(DateTimeResolver, 'date')
const JWT_SECRET = process.env.JWT_SECRET


// mutation
const Mutation = objectType({
    name: 'Mutation',
    definition(t) {

        // create user
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

        // login 
        t.nullable.field('login', {
            type: 'LoginData',
            args: {
                data: nullable(
                    arg({
                        type: "UserLoginInput"
                    }),
                ),
            },
            resolve: async (_, args, ctx) => {

                const { data } = args
                // const user = await ctx.prisma.user({ email: args.email })
                const user = await ctx.prisma.user.findUnique({
                    where: {
                        email: args.data.email,
                    },
                })
                // console.log("user: ", user)
                if (!user) {
                    throw new Error("No such user found")
                }
                const valid = args.data.password === user.password
                if (!valid) {
                    throw new Error("Invalid password")
                }

                const payload = {
                    userId: user.id,
                    email: user.email
                }
                let result
                // let account
                let token
                const genToken = () => {
                    token = jwt.sign(
                        payload,
                        JWT_SECRET,
                        {
                            expiresIn: 31556926, // 1 year in seconds
                        },

                    );
                }
                genToken()
                const account = ctx.prisma.account.create({
                    data: {
                        token: token,
                        message: token ? "success" : "error"
                    }
                })
                return account

            }
        })

        // logout
        t.nonNull.field("logout", {
            type: "User",
            resolve: async (_, args, context) => {
                context.response.clearCookie("token")
                return { message: "logged out successfully̥" }
            }
        })

        // create event
        t.nullable.field("createEvent", {
            type: "Event",

            args: {
                data: nonNull(arg({
                    type: "EventCreateInput",
                }),
                ),
            },
            resolve: async (_, args, context) => {
                const { data } = args
                let userEmail
                let user
                try {


                    const headers = context.headers;
                    // Fetch the token from the headers
                    const token = headers.authorization?.replace('jwt', '');

                    // Verify the token and extract the user email
                    const decodedToken = jwt.verify(token, JWT_SECRET);
                    userEmail = decodedToken.email;

                    user = await context.prisma.user.findUnique({
                        where: {
                            email: userEmail, // Assuming you have the user email available
                        },
                    })
                    if (user && user.role === "ADMIN") {
                        // const email = user.email;
                        // const role = user.role;
                        console.log(user)
                        return context.prisma.event.create({
                            data: {
                                title: data.title,
                                description: data.description,
                                imageUrl: data.imageUrl,
                                date: data.date,
                                places: data.places,
                                price: data.price,
                                tickets: data.tickets,
                                creator: { connect: { email: userEmail } },

                            }
                        })
                    } else {
                        console.log("not creator")
                        //  throw new Error('You are not authorized to create an event')
                        return null

                    }

                } catch (e) {
                    console.log(e)
                    if (e instanceof Prisma.PrismaClientKnownRequestError) {
                        // The .code property can be accessed in a type-safe manner
                        if (e.code === 'P2002') {
                            console.log(
                                'You are not authorized to create an event'
                            )
                        }
                    }
                    throw e
                    const error = prismaCustomErrorHandler(e);
                    return error
                }
            }
        })

        // delete event
        t.nullable.field("deleteEventMutation", {
            type: "DeleteEvent",
            args: {
                data: nonNull(arg({
                    type: "EventDeleteInput",
                }),
                ),
            },
            resolve: async (_, args, context) => {
                const { data } = args
                let userEmailToRemoveEvent
                let userToRemoveEvent
                try {
                    const headers = context.headers;
                    // Fetch the token from the headers
                    const token = headers.authorization?.replace('jwt', '');

                    // Verify the token and extract the user email
                    const decodedToken = jwt.verify(token, JWT_SECRET);
                    userEmailToRemoveEvent = decodedToken.email;
                    console.log(context.prisma.event)
                    userToRemoveEvent = await context.prisma.event.findFirst({
                        where: {
                          id: parseInt(data.id),
                          creator: {
                            email: userEmailToRemoveEvent,
                          },
                        },
                      })
                    if (userToRemoveEvent) {
                        await context.prisma.event.delete({
                            where: {
                              id: userToRemoveEvent.id,
                            },
                          });
                        console.log('can delete')
                        return {
                            success: true,
                            message: 'Event deleted Successfully.',
                          };
                    } else {
                        console.log('cannont delete')
                        return {
                            success: false,
                            message: 'Your unauthorized to delete this event.',
                          };
                    }
                } catch (e) {
                    console.log(e)
                }

            }

        })
    }
}
)

const Query = objectType({
    name: "Query",
    definition(t) {
        t.nullable.list.field('allEvents', {
            type: 'AllEvent',
            resolve: (_, __, context) => {
              return context.prisma.event.findMany();
            },
          });
    }
})



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
        t.int('id')
        t.string('title')
        t.string('description')
        t.string('imageUrl')
        t.string('date')
        t.string('places')
        t.int('price')
        t.int('tickets')
        t.field('creator', {
            type: 'User',
            resolve: async (parent, _, context) => {
                console.log(parent)
              const event = await context.prisma.event.findUnique({
                where: { id: parent.id },
                include: { creator: true },
              });
          
              return event.creator;
            },
          });


        // t.nonNull.list.nonNull.field('user', {
        //     type: 'User',
        //     resolve: (parent, _, context) => {
        //         return []
        //     },
        // })
    }
})

const AllEvent = objectType({
    name: 'AllEvent',
    definition(t) {
        t.int('id')
        t.string('title')
        t.string('description')
        t.string('imageUrl')
        t.string('date')
        t.string('places')
        t.int('price')
        t.int('tickets')
        t.field('creator', {
            type: 'String',
            resolve: async (parent, _, context) => {
                console.log(parent)
              const event = await context.prisma.event.findUnique({
                where: { id: parent.id },
                include: { creator: true },
              });
          
              return event.creator.email;
            },
          });


        // t.nonNull.list.nonNull.field('user', {
        //     type: 'User',
        //     resolve: (parent, _, context) => {
        //         return []
        //     },
        // })
    }
})

const LoginData = objectType({
    name: "LoginData",
    definition(t) {
        t.nullable.string("token")
        t.nullable.string("message")

    }
})

const DeleteEvent = objectType({
    name: "DeleteEvent",
    definition(t) {
        t.nullable.string("message")

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
        t.nonNull.field('event', { type: 'EventCreateInput' })
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

const EventDeleteInput = inputObjectType({
    name: 'EventDeleteInput',
    definition(t) {
        t.nonNull.string('id')
    }
})

const UserLoginInput = inputObjectType({
    name: "UserLoginInput",
    definition(t) {
        t.nonNull.string("email")
        t.nonNull.string("password")
    }
})
const prisma = new PrismaClient()

// make schema
const schema = makeSchema({
    types: [
        Mutation,
        Query,
        User,
        Event,
        AllEvent,
        DeleteEvent,
        LoginData,
        UserCreateInput,
        EventCreateInput,
        EventDeleteInput,
        DateTime,
        UserLoginInput
    ],
    outputs: {
        schema: __dirname + '/../schema.graphql',
        typegen: __dirname + '/generated/nexus.ts',
    },
    contextType: {
        module: require.resolve('./context'),
        context: "Context"
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