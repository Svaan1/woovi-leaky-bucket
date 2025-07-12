import { GraphQLString, GraphQLNonNull } from 'graphql';
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import { User } from '../UserModel';
import { errorField } from '@entria/graphql-mongo-helpers';
import { comparePassword } from '../../auth/crypt';

export type UserLoginInput = {
    email: string;
    password: string;
};

const mutation = mutationWithClientMutationId({
    name: 'UserLogin',
    inputFields: {
        email: {
            type: new GraphQLNonNull(GraphQLString),
        },
        password: {
            type: new GraphQLNonNull(GraphQLString),
        }
    },
    mutateAndGetPayload: async (args: UserLoginInput) => {
        const user = await User.findOne({
            email: args.email
        })

        if (!user) {
            return {
                token: null,
                error: "User not found."
            }
        }

        if (!comparePassword(args.password, user.password)) {
            return {
                token: null,
                error: "Invalid password."
            }
        }

        return {
            token: "aaa",
            error: null,
        }
    },
    outputFields: {
        token: {
            type: GraphQLString
        },
        ...errorField
    },
});

export const UserLoginMutation = {
    ...mutation,
};
