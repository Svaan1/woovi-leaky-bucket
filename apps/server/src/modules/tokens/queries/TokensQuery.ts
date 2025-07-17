import { GraphQLFieldConfig, GraphQLNonNull } from "graphql";
import { TokensType } from "../TokensType";
import { fromGlobalId } from "graphql-relay";

export const TokensQuery: GraphQLFieldConfig<any, any> = {
  type: new GraphQLNonNull(TokensType),
  description: "Get current user's token information",
  resolve: async (parent, args, { user, leakyBucket }) => {
    if (!leakyBucket) {
      throw new Error("Leaky bucket service not available");
    }

    const currentTokens = await leakyBucket.getCurrentTokens();
    
    return {
      currentTokens,
      maxTokens: leakyBucket.bucketConfig.maxTokens,
    };
  },
};
