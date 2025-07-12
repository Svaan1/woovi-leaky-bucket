import { GraphQLObjectType } from 'graphql';
import { userMutations } from '../modules/user/mutations/userMutations';


export const MutationType = new GraphQLObjectType({
	name: 'Mutation',
	fields: () => ({
		...userMutations,
	}),
});
