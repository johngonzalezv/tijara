import { nonNull, objectType, stringArg, booleanArg, extendType } from 'nexus';
import { connectionFromArraySlice, cursorToOffset } from 'graphql-relay';
import { User } from './User';
import search from '../../components/Layout/search';

export const Product = objectType({
  name: 'Product',
  definition(t) {
    t.string('id');
    t.int('index');
    t.string('title');
    t.string('price');
    t.string('description');
    t.string('imageUrl');
    t.boolean('available');
    t.field('user', {
      type: User,
      async resolve(parent, _args, ctx) {
        return await ctx.prisma.user.findUnique({ where: {id: parent.userId} })
      }
    });
  },
});

// get all products
export const ProductQuery = extendType({
  type: 'Query',
  definition(t) {
    t.connectionField('products', {
      type: Product,
      additionalArgs: {
        searchText: stringArg()
      },
      resolve: async (_, { after, first, searchText }, ctx) => {
        const offset = after ? cursorToOffset(after) + 1 : 0;
        if (isNaN(offset)) throw new Error('cursor is invalid');

        let productParams: {take: number, skip: number} = {take: first, skip: offset};
        let whereParams: {where: object} = {where: { title: {search: searchText} }};
        let countParams: {};

        if (!!searchText) {
          productParams = {...productParams, ...whereParams}
          countParams = {...countParams, ...whereParams}
        }

        const [totalCount, products] = await Promise.all([
          ctx.prisma.product.count(countParams),
          ctx.prisma.product.findMany(productParams)
        ])

        return connectionFromArraySlice(
          products,
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

        if (user.role !== 'PROVIDER') {
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

//  Get unique product
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

// Update product
export const UpdateProductMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('updateProduct', {
      type: 'Product',
      args: {
        id: stringArg(),
        title: stringArg(),
        description: stringArg(),
        imageUrl: stringArg(),
        price: stringArg(),
        available: booleanArg(),
      },
      resolve(_parent, args, ctx) {
        return ctx.prisma.product.update({
          where: { id: args.id},
          data: {
            title: args.title,
            description: args.description,
            imageUrl: args.imageUrl,
            price: args.price,
            available: args.available,
          },
        });
      },
    });
  },
});