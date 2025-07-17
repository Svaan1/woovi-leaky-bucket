import { GraphQLObjectType, GraphQLString, GraphQLNonNull } from "graphql";
import { globalIdField, connectionDefinitions } from "graphql-relay";

import { IUser } from "./UserModel";
import { nodeInterface } from "../node/typeRegister";
import { registerTypeLoader } from "../node/typeRegister";
import { UserLoader } from "./UserLoader";

const UserType = new GraphQLObjectType<IUser>({
  name: "User",
  description: "Represents a user",
  fields: () => ({
    id: globalIdField("User"),
    name: {
      type: GraphQLString,
      resolve: (user) => user.name,
    },
    email: {
      type: GraphQLString,
      resolve: (user) => user.email,
    },
    createdAt: {
      type: GraphQLString,
      resolve: (message) => message.createdAt.toISOString(),
    },
  }),
  interfaces: () => [nodeInterface],
});

const UserConnection = connectionDefinitions({
  name: "User",
  nodeType: UserType,
});

registerTypeLoader(UserType, UserLoader.load);

export { UserType, UserConnection };
