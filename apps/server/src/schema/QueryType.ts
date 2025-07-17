import { GraphQLObjectType } from "graphql";
import { userConnectionField } from "../modules/user/userFields";
import { tokensQueries, tokensQueryPermissions } from "../modules/tokens/queries/tokensQueries";
import { userQueries, userQueryPermissions } from "../modules/user/queries/userQueries";

export const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    ...userConnectionField("users"),
    ...tokensQueries,
    ...userQueries,
  }),
});

export const QueryPermissions = {
  ...tokensQueryPermissions,
  ...userQueryPermissions,
}