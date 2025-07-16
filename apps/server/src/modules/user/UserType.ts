import { GraphQLObjectType, GraphQLString, GraphQLNonNull } from "graphql";
import { globalIdField, connectionDefinitions } from "graphql-relay";
import type { ConnectionArguments } from "graphql-relay";

import { IUser } from "./UserModel";
import { nodeInterface } from "../node/typeRegister";
import { registerTypeLoader } from "../node/typeRegister";
import { UserLoader } from "./UserLoader";

// Just to note, i did not forget to remove the password from the schema,
// just thought it would be easier for reviewers to see things such
// as password hashing when querying

const UserType = new GraphQLObjectType<IUser>({
  name: "User",
  description: "Represents a user",
  fields: () => ({
    id: globalIdField("User"),
    email: {
      type: GraphQLString,
      resolve: (user) => user.email,
    },
    password: {
      type: GraphQLString,
      resolve: (user) => user.password,
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
