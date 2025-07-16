import { GraphQLObjectType } from "graphql";

import { userMutations, userMutationPermissions } from "../modules/user/mutations/userMutations";
import { pixMutations, pixMutationPermissions} from "../modules/pix/mutations/pixMutations";

export const MutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    ...userMutations,
    ...pixMutations,
  }),
});

export const MutationPermissions = {
  ...userMutationPermissions,
  ...pixMutationPermissions,
}
