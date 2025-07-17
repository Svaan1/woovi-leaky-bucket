import { GraphQLFieldConfig, GraphQLNonNull } from "graphql";
import { UserType } from "../UserType";
import { fromGlobalId } from "graphql-relay";

export const ViewerQuery: GraphQLFieldConfig<any, any> = {
  type: UserType,
  description: "Get current authenticated user information",
  resolve: async (parent, args, { user, dataloaders }) => {
    const { id: userId } = fromGlobalId(user.id);
        
    return {
        
    };
  },
};
