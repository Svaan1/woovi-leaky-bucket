import { shield } from "graphql-shield"
import { GraphQLSchema } from "graphql";

import { QueryType, QueryPermissions } from "./QueryType";
import { MutationType, MutationPermissions } from "./MutationType";
import { SubscriptionType, SubscriptionPermissions } from "./SubscriptionType";

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  // subscription: SubscriptionType,
});

export const permissions = shield({
  Query: QueryPermissions, 
  Mutation: MutationPermissions,
  // Subscription: SubscriptionPermissions,
}, {allowExternalErrors: true})
