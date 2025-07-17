import { GraphQLObjectType, GraphQLInt, GraphQLString } from "graphql";

export const TokensType = new GraphQLObjectType({
  name: "Tokens",
  description: "User's current token information",
  fields: () => ({
    currentTokens: {
      type: GraphQLInt,
      description: "Current number of tokens available",
      resolve: (obj) => obj.currentTokens,
    },
    maxTokens: {
      type: GraphQLInt,
      description: "Maximum number of tokens that can be held",
      resolve: (obj) => obj.maxTokens,
    },
  }),
});
