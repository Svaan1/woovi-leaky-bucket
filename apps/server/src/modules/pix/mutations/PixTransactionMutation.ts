import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLEnumType,
} from "graphql";
import { mutationWithClientMutationId } from "graphql-relay";


export type PixTransactionInput = {
  pixKey: string;
  value: number;
};

const mutation = mutationWithClientMutationId({
  name: "PixTransaction",
  inputFields: {
    pixKey: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The PIX key for the transaction.",
    },
    value: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: "The value of the PIX transaction.",
    },
  },
  mutateAndGetPayload: async (
    args: PixTransactionInput,
    { user, leakyBucket },
  ) => {
    const requestCost = 1;
    const isAllowed = await leakyBucket.leakTokens(requestCost);

    if (!isAllowed) {
      throw new Error("Rate limited, please wait.");
    }

    const VALID_PIX_KEYS = {
      "valid-key": {
        name: "Paulo Ricardo",
        bank: "Nubank",
      },
    };

    const pixKey = VALID_PIX_KEYS[args.pixKey];
  
    if (!pixKey) {
      throw new Error("Invalid key");
    }

    await leakyBucket.refundTokens(requestCost);

    return {
      ...pixKey,
    };
  },
  outputFields: {
    name: {
      type: GraphQLString,
      description: "Name of the owner of the Pix Key",
    },
    bank: {
      type: GraphQLString,
      description: "Name of the bank associated with the Pix Key",
    },
  },
});

export const PixTransactionMutation = {
  ...mutation,
};
