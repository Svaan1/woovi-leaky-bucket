import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  jest,
  afterAll,
} from "@jest/globals";
import { graphql } from "graphql";
import { schema } from "../schema/schema";
import { toGlobalId } from "graphql-relay";
import { LeakyBucketService } from "../leakyBucket";

import { Redis } from 'ioredis';
import { RedisContainer } from "@testcontainers/redis";

const USER_ID = "1";
const VALID_PIX_KEY = "valid-key";
const INVALID_PIX_KEY = "invalid-key";

const config = {
  maxTokens: 10,
  fillIntervalMs: 1000 * 60 * 60, // 1 hour
  bucketTtlSeconds: 60 * 60 * 24 * 7, // 1 week
};

const executeMutation = (pixKey: string, contextValue: any) => {
  const source = `
          mutation PixTransaction($input: PixTransactionInput!) {
              PixTransaction(input: $input) {
                  clientMutationId
              }
          }
  `;

  const variableValues = {
    input: {
      pixKey,
      value: 100,
      clientMutationId: "some-client-mutation-id",
    },
  };

  return graphql({ schema, source, variableValues, contextValue });
};

describe("PixTransactionMutation with Leaky Bucket", () => {
  let redisContainer: any;
  let redis: Redis;
  let leakyBucket: LeakyBucketService;
  let contextValue: any;

  beforeAll(async () => {
    redisContainer = await new RedisContainer("redis:alpine").start();
    redis = new Redis({
      host: redisContainer.getHost(),
      port: redisContainer.getPort(),
    });
    
    leakyBucket = new LeakyBucketService(USER_ID, config, redis);
    
    contextValue = {
      user: {
        id: toGlobalId("User", USER_ID),
      },
      leakyBucket,
    };
  });

  beforeEach(async () => {
    expect(await leakyBucket.getCurrentTokens()).toBe(config.maxTokens);
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await redis.flushall();
    jest.useRealTimers();
  });

  afterAll(async () => {
    if (redis) {
      redis.disconnect();
    }
    if (redisContainer) {
      await redisContainer.stop();
    }
  });

  it("should refund tokens on a successful transaction", async () => {
    const result = await executeMutation(VALID_PIX_KEY, contextValue);
    expect(result.errors).toBeUndefined();
    
    // Should have consumed no tokens
    expect(await leakyBucket.getCurrentTokens()).toBe(10);
  });

  it("should consume one token on a failed transaction", async () => {
    const result = await executeMutation(INVALID_PIX_KEY, contextValue);
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].message).toBe("Invalid key");
    
    // Should have consumed one token
    expect(await leakyBucket.getCurrentTokens()).toBe(9);
  });

  it("should become rate-limited after 10 failed transactions", async () => {
    for (let i = 0; i < 10; i++) {
      await executeMutation(INVALID_PIX_KEY, contextValue);
    }

    // Should have consumed all tokens
    expect(await leakyBucket.getCurrentTokens()).toBe(0)

    const result = await executeMutation(INVALID_PIX_KEY, contextValue);

    // Should rate limit next request
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].message).toContain("Rate limited");
  });

  it("should replenish one token after one hour", async () => {
    for (let i = 0; i < 10; i++) {
      await executeMutation(INVALID_PIX_KEY, contextValue);
    }

    // Should be empty after 10 failed transactions
    expect(await leakyBucket.getCurrentTokens()).toBe(0);

    let result = await executeMutation(INVALID_PIX_KEY, contextValue);

    // Should rate limit next request
    expect(result.errors?.[0].message).toContain("Rate limited");

    jest.advanceTimersByTime(1000 * 60 * 60);

    // Should have 1 token after 1 hour
    expect(await leakyBucket.getCurrentTokens()).toBe(1);

    result = await executeMutation(INVALID_PIX_KEY, contextValue);
    expect(result.errors?.[0].message).toBe("Invalid key");
    
    // Should be back to 0 after consuming the replenished token
    expect(await leakyBucket.getCurrentTokens()).toBe(0);
  });

  it("should replenish all tokens after 10 hours", async () => {
    for (let i = 0; i < 10; i++) {
      await executeMutation(INVALID_PIX_KEY, contextValue);
    }

    // Should be empty after 10 failed transactions
    expect(await leakyBucket.getCurrentTokens()).toBe(0);

    jest.advanceTimersByTime(1000 * 60 * 60 * 10);

    // Should be fully replenished after 10 hours
    expect(await leakyBucket.getCurrentTokens()).toBe(10);

    for (let i = 0; i < 10; i++) {
      const result = await executeMutation(INVALID_PIX_KEY, contextValue);
      expect(result.errors?.[0].message).toBe("Invalid key");
    }

    // Should be empty again after 10 failed transactions
    expect(await leakyBucket.getCurrentTokens()).toBe(0);

    const result = await executeMutation(INVALID_PIX_KEY, contextValue);
    expect(result.errors?.[0].message).toContain("Rate limited");
  });
});
