import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { graphql } from "graphql";
import { schema } from "../schema/schema";
import { redis } from "../redis";
import { toGlobalId } from "graphql-relay";
import { LeakyBucketService } from "../leakyBucket";

jest.mock("../redis");

const mockedRedis = redis as jest.Mocked<typeof redis>;

describe("Tokens Query", () => {
  let redisStore: { [key: string]: { tokens: string; lastFillTime: string } } = {};

  const USER_ID = "1";
  const BUCKET_KEY = `leaky-bucket:user:${USER_ID}`;

  const config = {
    maxTokens: 10,
    fillIntervalMs: 1000 * 60 * 60, // 1 hour
    bucketTtlSeconds: 60 * 60 * 24 * 7, // 1 week
  };

  const leakyBucket = new LeakyBucketService(USER_ID, config);

  const contextValue = {
    user: {
      id: toGlobalId("User", USER_ID),
    },
    leakyBucket,
  };

  const executeTokensQuery = () => {
    const source = `
      query {
        tokens {
          userId
          currentTokens
          maxTokens
        }
      }
    `;
    return graphql({ schema, source, contextValue });
  };

  beforeEach(() => {
    redisStore = {};

    mockedRedis.hgetall.mockImplementation((key: string | Buffer) =>
      Promise.resolve(redisStore[key.toString()] || {}),
    );

    mockedRedis.hset.mockImplementation((key: string | Buffer, value: any) => {
      const keyStr = key.toString();
      if (!redisStore[keyStr]) {
        redisStore[keyStr] = { tokens: "", lastFillTime: "" };
      }
      Object.assign(redisStore[keyStr], value);
      return Promise.resolve(1);
    });

    (mockedRedis.expire as jest.Mock).mockImplementation(() =>
      Promise.resolve(1),
    );

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return current tokens for a new user", async () => {
    const result = await executeTokensQuery();
    
    expect(result.errors).toBeUndefined();
    expect(result.data?.tokens).toEqual({
      userId: USER_ID,
      currentTokens: 10,
      maxTokens: 10,
    });
  });

  it("should return current tokens after consuming some", async () => {
    // Consume 3 tokens
    await leakyBucket.leakTokens(3);
    
    const result = await executeTokensQuery();
    
    expect(result.errors).toBeUndefined();
    expect(result.data?.tokens).toEqual({
      userId: USER_ID,
      currentTokens: 7,
      maxTokens: 10,
    });
  });

  it("should return updated tokens after time passes", async () => {
    // Consume all tokens
    await leakyBucket.leakTokens(10);
    
    // Advance time by 2 hours (should refill 2 tokens)
    jest.advanceTimersByTime(2 * 60 * 60 * 1000);
    
    const result = await executeTokensQuery();
    
    expect(result.errors).toBeUndefined();
    expect(result.data?.tokens).toEqual({
      userId: USER_ID,
      currentTokens: 2,
      maxTokens: 10,
    });
  });

  it("should require authentication", async () => {
    const contextValueWithoutUser = {
      leakyBucket,
    };

    const result = await graphql({
      schema,
      source: `
        query {
          tokens {
            userId
            currentTokens
            maxTokens
          }
        }
      `,
      contextValue: contextValueWithoutUser,
    });

    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].message).toContain("User not authenticated");
  });
});
