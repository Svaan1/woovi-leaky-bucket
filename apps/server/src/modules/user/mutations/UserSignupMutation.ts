import { GraphQLString, GraphQLNonNull } from 'graphql';
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import { User } from '../UserModel';
import { userField } from '../userFields';
import { hashPassword } from '../../auth/crypt';

export type UserSignupInput = {
	email: string;
    password: string;
};

const mutation = mutationWithClientMutationId({
	name: 'UserSignup',
	inputFields: {
        email: {
            type: new GraphQLNonNull(GraphQLString),
        },
        password: {
			type: new GraphQLNonNull(GraphQLString),
        }
	},
	mutateAndGetPayload: async (args: UserSignupInput) => {
		const user = await new User({
            email: args.email,
            password: hashPassword(args.password)
		}).save();

		return {
			user: user._id.toString(),
		};
	},
	outputFields: {
		...userField('user'),
	},
});

export const UserSignupMutation = {
	...mutation,
};
