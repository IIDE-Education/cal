import type { Prisma } from "@prisma/client";
import { PrismaClient as PrismaClientWithoutExtension } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

import { bookingReferenceMiddleware } from "./middleware";

const prismaOptions: Prisma.PrismaClientOptions = {};

if (!!process.env.NEXT_PUBLIC_DEBUG) prismaOptions.log = ["query", "error", "warn"];

const prismaWithoutClientExtensions = new PrismaClientWithoutExtension(prismaOptions);

export const customPrisma = (options?: Prisma.PrismaClientOptions) =>
  new PrismaClientWithoutExtension({ ...prismaOptions, ...options }).$extends(withAccelerate());

// If any changed on middleware server restart is required
// TODO: Migrate it to $extends
bookingReferenceMiddleware(prismaWithoutClientExtensions);

// FIXME: Due to some reason, there are types failing in certain places due to the $extends. Fix it and then enable it
// Specifically we get errors like `Type 'string | Date | null | undefined' is not assignable to type 'Exact<string | Date | null | undefined, string | Date | null | undefined>'`
const prismaWithClientExtensions = prismaWithoutClientExtensions
  //
  .$extends(withAccelerate());
// .$extends({
//   query: {
//     $allModels: {
//       async $allOperations({ model, operation, args, query }) {
//         const start = performance.now();
//         /* your custom logic here */
//         const res = await query(args);
//         const end = performance.now();
//         logger.debug("Query Perf: ", `${model}.${operation} took ${(end - start).toFixed(2)}ms\n`);
//         return res;
//       },
//     },
//   },
// });
// .$extends({
//   name: "teamUpdateWithMetadata",
//   query: {
//     team: {
//       async update({ model, operation, args, query }) {
//         if (args.data.metadata) {
//          // Prepare args.data with merged metadata
//         }
//         return query(args);
//       },
//     },
//   },
// })

// const prismaWithClientExtensions = prismaWithoutClientExtensions;

export const prisma =
  ((globalThis as any).prisma as typeof prismaWithClientExtensions) || prismaWithClientExtensions;

if (process.env.NODE_ENV !== "production") {
  (globalThis as any).prisma = prisma;
}

export type PrismaClient = typeof prismaWithClientExtensions;
export default prisma;

export * from "./selects";
