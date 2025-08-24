// graphql/builder.ts

// 1.
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from '@pothos/plugin-prisma';
import prisma from "../lib/prisma";
import RelayPlugin from "@pothos/plugin-relay";
import {createContext} from './context'
import type PrismaTypes from '@pothos/plugin-prisma/generated';
// 2. 
export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes,
  Context: ReturnType<typeof createContext>,
}>({
  plugins: [PrismaPlugin, RelayPlugin],
  relayOptions: {
  },
  prisma: {
    client: prisma,
  }
})

// 5. 
builder.queryType({
  fields: (t) => ({
    ok: t.boolean({
      resolve: () => true,
    }),
  }),
});