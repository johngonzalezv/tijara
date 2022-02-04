import { nonNull, objectType, stringArg, extendType } from 'nexus';
import { connectionFromArraySlice, cursorToOffset } from 'graphql-relay';
import { User } from './User';

export const Product = objectType({
  name: 'Product',
  definition(t) {
    t.string('id');
    t.int('index');
    t.string('title');
    t.string('price');
    t.string('description');
    t.string('imageUrl');
    t.field('user', { type: User });
  },
});

// get all products
export const ProductQuery = extendType({
  type: 'Query',
  definition(t) {
    t.connectionField('products', {
      type: Product,
      resolve: async (_, { after, first }, ctx) => {
        const offset = after ? cursorToOffset(after) + 1 : 0;
        if (isNaN(offset)) throw new Error('cursor is invalid');

        const [totalCount, items] = await Promise.all([
          ctx.prisma.product.count(),
          ctx.prisma.product.findMany({
            take: first,
            skip: offset,
          }),
        ]);

        return connectionFromArraySlice(
          items,
          { first, after },
          { sliceStart: offset, arrayLength: totalCount }
        );
      },
    });
  },
});

// Create product
export const CreateProductMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createProduct', {
      type: Product,
      args: {
        title: nonNull(stringArg()),
        price: nonNull(stringArg()),
        imageUrl: nonNull(stringArg()),
        description: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        if(!ctx.user) {
          throw new Error('You need to be logged in to perform an action')
        }

        const user = await ctx.prisma.user.findUnique({
          where: {
            email: ctx.user.email
          }
        });

        if (user.role !== 'ADMIN') {
          throw new Error('You do not have permission to perform action')
        }
        const newProduct = {
          title: args.title,
          price: args.price,
          imageUrl: args.imageUrl,
          description: args.description,
          user: {connect: { id: user.id }}
        }
        return await ctx.prisma.product.create({
          data: newProduct,
        })
      },
    })
  },
});

//  Get unique Product
export const ProductByIdQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('product', {
      type: Product,
      args: { id: nonNull(stringArg())},
      resolve(_parent, args, ctx) {
        const product = ctx.prisma.product.findUnique({
          where: {
            id: args.id
          }
        });
        return product;
      }
    })
  }
});