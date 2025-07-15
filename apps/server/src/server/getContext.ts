import { ParameterizedContext } from "koa";
import { getDataloaders } from "../modules/loader/loaderRegister";
import { decodeToken } from "../modules/auth/jwt";
import { LeakyBucketService } from "../leakyBucket";

const getContext = (ctx: ParameterizedContext) => {
    const dataloaders = getDataloaders();

    const token = ctx.headers.authorization?.replace("Bearer ", "");
    const user = decodeToken(token);

    const leakyBucket = user ? new LeakyBucketService(user.id, {
        fillIntervalMs: 1000 * 60 * 60,
        maxTokens: 10,
        bucketTtlSeconds: 60 * 60,
    }) : null

    return {
        dataloaders,
        user,
        leakyBucket
    } as const;
};

export { getContext };
