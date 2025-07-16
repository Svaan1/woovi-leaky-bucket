import { GraphQLObjectType } from "graphql";
import { userMutations } from "../modules/user/mutations/userMutations";
import { pixMutations } from "../modules/pix/mutations/pixMutations";

export const MutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    ...userMutations,
    ...pixMutations,
  }),
});
