import { GraphQLFieldConfig, GraphQLNonNull } from "graphql";
import { User } from "../UserModel";
import { UserType } from "../UserType";
import { fromGlobalId, toGlobalId } from "graphql-relay";

export const ViewerQuery: GraphQLFieldConfig<any, any> = {
  type: UserType,
  description: "Get current authenticated user information",
  resolve: async (parent, args, { user, dataloaders }) => {
    const existingUser = await User.findById(user.id)

    if (!existingUser) {
      throw Error("Could not find user (this should never happen though)")
    }

    return existingUser
  },
};
