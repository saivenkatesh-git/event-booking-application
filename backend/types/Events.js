import { builder } from "../builder";

builder.prismaObject('Event',{
    fields:(t)=>({
        id: t.exposeID('id'),
        title:  t.exposeString('title'),
        description: t.exposeString('description'),
        imageUrl:  t.exposeString('imageUrl'),
        date: t.exposeString('date'),
        places:  t.exposeString('places'),
        price: t.exposeInt('price'),
        tickets: t.exposeInt('tickets'),
        creator: t.field('creator', {
                        type: 'String',
                        resolve: async (parent, _, context) => {
                            console.log(parent)
                          const event = await context.prisma.event.findUnique({
                            where: { id: parent.id },
                            include: { creator: true },
                          });
                      
                          return event.creator.email;
                        },
                      }),
    })
}
    
)

builder.queryField('AllEvents',(t)=>
t.prismaConnection({
    type:'Event',
    cursor:'id',
    resolve: (query, _parent, _args, _ctx, _info) => {
                      return prisma.event.findMany({...query});
                    },
    })
)
