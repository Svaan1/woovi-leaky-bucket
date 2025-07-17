import { GraphQLString, GraphQLNonNull } from "graphql";
import { mutationWithClientMutationId } from "graphql-relay";

import { User } from "../UserModel";
import { hashPassword } from "../../auth/crypt";
import { generateToken } from "../../auth/jwt";
import { UserType } from "../UserType";

export type UserSignupInput = {
  name: string;
  email: string;
  password: string;
};

const mutation = mutationWithClientMutationId({
  name: "UserSignup",
  inputFields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
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
      name: args.name,
      email: args.email,
      password: await hashPassword(args.password),
    }).save();

    return {
      token: generateToken({ id: user.id }),
      user: user
    };
  },
  outputFields: {
    token: {
      type: GraphQLString,
    },
    user: {
      type: UserType
    }
  },
});

export const UserSignupMutation = {
  ...mutation,
};
