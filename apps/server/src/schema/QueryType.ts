import { GraphQLObjectType } from "graphql";
import { userConnectionField } from "../modules/user/userFields";

export const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    ...userConnectionField("users"),
  }),
});

export const QueryPermissions = {

}