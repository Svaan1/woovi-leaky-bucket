import { GraphQLString, GraphQLNonNull, GraphQLFloat } from "graphql";
import { mutationWithClientMutationId } from "graphql-relay";

const VALID_PIX_KEYS = ["valid-key", "123-456"];
const REQUEST_COST = 1;

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
    mutateAndGetPayload: async (args: PixTransactionInput, { user, leakyBucket }) => {
        if (!user || !leakyBucket) {
            throw new Error("Authentication required.");
        }

        const isAllowed = await leakyBucket.leakTokens(REQUEST_COST);
        if (!isAllowed) {
            throw new Error('Rate limited, please wait.');
        }

        const isKeyValid = VALID_PIX_KEYS.includes(args.pixKey);
        if (!isKeyValid) {
            throw new Error("Invalid key");
        }

        await leakyBucket.refundTokens(REQUEST_COST);

        return {};
    },
    outputFields: {},
});

export const PixTransactionMutation = {
    ...mutation,
};
