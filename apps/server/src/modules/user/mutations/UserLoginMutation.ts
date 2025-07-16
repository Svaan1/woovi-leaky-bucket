import { GraphQLString, GraphQLNonNull } from "graphql";
import { mutationWithClientMutationId } from "graphql-relay";

import { User } from "../UserModel";
import { comparePassword } from "../../auth/crypt";
import { generateToken } from "../../auth/jwt";

export type UserLoginInput = {
  email: string;
  password: string;
};

const mutation = mutationWithClientMutationId({
  name: "UserLogin",
  inputFields: {
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  mutateAndGetPayload: async (args: UserLoginInput, context) => {
    const user = await User.findOne({
      email: args.email,
    });

    if (!user) {
      throw new Error("User not found.");
    }

    if (!(await comparePassword(args.password, user.password))) {
      throw new Error("Invalid password.");
    }

    return {
      token: generateToken({ id: user.id }),
    };
  },
  outputFields: {
    token: {
      type: GraphQLString,
    },
  },
});

export const UserLoginMutation = {
  ...mutation,
};
