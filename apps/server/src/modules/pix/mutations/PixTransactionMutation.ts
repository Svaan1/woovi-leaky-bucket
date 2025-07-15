import { GraphQLString, GraphQLNonNull, GraphQLFloat, GraphQLEnumType } from "graphql";
import { mutationWithClientMutationId } from "graphql-relay";

const REQUEST_COST = 1;

const VALID_PIX_KEYS = {
    "valid-key": {
        name: "Paulo Ricardo",
        bank: "Nubank",
    }
};

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

        const pixKey = VALID_PIX_KEYS[args.pixKey];
        if (!pixKey) {
            throw new Error("Invalid key");
        }

        await leakyBucket.refundTokens(REQUEST_COST);

        return {
            ...pixKey
        };
    },
    outputFields: {
        name: {
            type: GraphQLString,
            description: "Name of the owner of the Pix Key"
        },
        bank: {
            type: GraphQLString,
            description: "Name of the bank associated with the Pix Key"
        }
    },
});

export const PixTransactionMutation = {
    ...mutation,
};
