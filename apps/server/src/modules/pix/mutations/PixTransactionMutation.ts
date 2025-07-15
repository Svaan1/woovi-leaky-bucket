import { GraphQLString, GraphQLNonNull, GraphQLFloat } from "graphql";
import { mutationWithClientMutationId, toGlobalId } from "graphql-relay";

const validKeys = ["valid-key", "123-456"]

export type PixTransactionInput = {
    pixKey: string;
    value: number;
};

const mutation = mutationWithClientMutationId({
    name: "PixTransaction",
    inputFields: {
        pixKey: {
            type: new GraphQLNonNull(GraphQLString),
            description: "",
        },
        value: {
            type: new GraphQLNonNull(GraphQLFloat),
            description: "",
        },
    },
    mutateAndGetPayload: async (args: PixTransactionInput, context) => {
        if (!context?.user) {
            throw new Error("Unauthenticated");
        }

        const requestCost = 1;
        const allowed = await context.leakyBucket.leakTokens(requestCost)

        if (!allowed) {
            throw new Error('Rate limited, please wait')
        }

        // Here i mock the pix query functionality, i could either flip a coin and error out sometimes
        // or for better testability add a list of valid pix keys, ill do the latter
        if (!validKeys.includes(args.pixKey)) {
            throw new Error("Invalid key")
        }

        await context.leakyBucket.refundTokens(context.user.id, requestCost)
    },
    outputFields: {},
});

export const PixTransactionMutation = {
    ...mutation,
};
