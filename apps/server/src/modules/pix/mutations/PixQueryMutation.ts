import { GraphQLString, GraphQLNonNull, GraphQLFloat } from "graphql";
import { mutationWithClientMutationId, toGlobalId } from "graphql-relay";
import { useLeakyBucket } from "../leakyBucket";

export type PixQueryInput = {
    pixKey: string;
    value: number;
};

const validKeys = ["valid-key", "123-456"]

const mutation = mutationWithClientMutationId({
    name: "PixQuery",
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
    mutateAndGetPayload: async (args: PixQueryInput, context) => {
        if (!context.user) {
            throw new Error("Unauthenticated");
        }
        const requestCost = 1
        const leakyBucket = await useLeakyBucket(context.user.id, requestCost)

        if (!leakyBucket.allowed) {
            throw new Error('Rate limited, pleas~e wait')
        }

        // Here i mock the pix query functionality, i could either flip a coin and error out sometimes
        // or for better testability add a list of valid pix keys, ill do the latter

        if (!validKeys.includes(args.pixKey)) {
            throw new Error("Invalid key")
        }

        await leakyBucket.refundToken()

        return {

        }
    },
    outputFields: {},
});

export const PixQueryMutation = {
    ...mutation,
};
