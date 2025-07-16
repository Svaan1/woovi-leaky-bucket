import { ParameterizedContext } from "koa";
import { getDataloaders } from "../modules/loader/loaderRegister";
import { decodeToken } from "../modules/auth/jwt";
import { LeakyBucketService } from "../leakyBucket";
import { fromGlobalId } from "graphql-relay";

const getContext = (ctx: ParameterizedContext) => {
  const dataloaders = getDataloaders();

  const token = ctx.headers.authorization?.replace("Bearer ", "");
  const user = decodeToken(token);

  const config = {
    maxTokens: 10,
    fillIntervalMs: 1000 * 60 * 60, // 1 hour
    bucketTtlSeconds: 60 * 60 * 24 * 7, // 1 week
  };

  const leakyBucket = user
    ? new LeakyBucketService(fromGlobalId(user.id).id, config)
    : null;

  return {
    dataloaders,
    user,
    leakyBucket,
  } as const;
};

export { getContext };
