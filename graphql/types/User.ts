import { enumType, objectType } from 'nexus';
import { Product } from './Product';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.string('id');
    t.string('name');
    t.string('email');
    t.string('image');
    t.field('role', { type: Role });
    t.list.field('products', { type: Product });
    // t.list.field('products', {
    //   type: Product,
    //   async resolve(parent, _args, ctx) {
    //     return await ctx.prisma.user.findUnique({
    //       where: {id: parent.id}}).products
    //   },
    // });
  },
});

const Role = enumType({
  name: 'Role',
  members: ['SELLER', 'PROVIDER'],
});
