import { GraphQLString, GraphQLNonNull } from "graphql";
import { mutationWithClientMutationId, toGlobalId } from "graphql-relay";

import { User } from "../UserModel";
import { hashPassword } from "../../auth/crypt";
import { generateToken } from "../../auth/jwt";

export type UserSignupInput = {
  email: string;
  password: string;
};

const mutation = mutationWithClientMutationId({
  name: "UserSignup",
  inputFields: {
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  mutateAndGetPayload: async (args: UserSignupInput) => {
    const existingUser = await User.findOne({ email: args.email });
    if (existingUser) {
      throw new Error("Email already registered.");
    }

    const user = await new User({
      email: args.email,
      password: await hashPassword(args.password),
    }).save();

    return {
      token: await generateToken({ id: user.id }),
    };
  },
  outputFields: {
    token: {
      type: GraphQLString,
    },
  },
});

export const UserSignupMutation = {
  ...mutation,
};
