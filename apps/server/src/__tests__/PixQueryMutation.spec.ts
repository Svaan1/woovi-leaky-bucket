import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { graphql } from 'graphql';
import { schema } from '../schema/schema';
import { redis } from '../redis';
import { toGlobalId } from 'graphql-relay';

jest.mock('../server/redis');

const mockedRedis = redis as jest.Mocked<typeof redis>;

describe('PixQueryMutation with Leaky Bucket', () => {
  let redisStore: { [key: string]: { tokens: string; lastFillTime: string } } = {};
  const userId = '1';
  const contextValue = {
    user: {
      id: toGlobalId('User', userId),
    },
  };

  const executeMutation = (pixKey: string) => {
    const source = `
      mutation PixQuery($input: PixQueryInput!) {
        PixQuery(input: $input) {
          clientMutationId
        }
      }
    `;
    const variableValues = {
      input: {
        pixKey,
        value: 100,
        clientMutationId: 'some-client-mutation-id',
      },
    };
    return graphql({ schema, source, variableValues, contextValue });
  };

  beforeEach(() => {
    // Reset redis store and mock functions before each test
    redisStore = {};
    mockedRedis.hgetall.mockImplementation((key: string | Buffer) => Promise.resolve(redisStore[key.toString()]));
    mockedRedis.hset.mockImplementation((key: string | Buffer, value: any) => {
      const keyStr = key.toString();
      if (!redisStore[keyStr]) {
        redisStore[keyStr] = { tokens: '', lastFillTime: '' };
      }
      Object.assign(redisStore[keyStr], value);
      return Promise.resolve(1);
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not consume a token on a successful request', async () => {
    const result = await executeMutation('valid-key');
    expect(result.errors).toBeUndefined();

    const bucketKey = `bucket:${contextValue.user.id}`;
    const bucketData = redisStore[bucketKey];
    expect(parseInt(bucketData.tokens, 10)).toBe(10);
  });

  it('should consume one token on a failed request', async () => {
    const result = await executeMutation('invalid-key');
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].message).toBe('Invalid key');

    const bucketKey = `bucket:${contextValue.user.id}`;
    const bucketData = redisStore[bucketKey];
    expect(parseInt(bucketData.tokens, 10)).toBe(9);
  });

  it('should be rate-limited after 10 failed requests', async () => {
    for (let i = 0; i < 10; i++) {
      await executeMutation('invalid-key');
    }

    const bucketKey = `bucket:${contextValue.user.id}`;
    const bucketData = redisStore[bucketKey];
    expect(parseInt(bucketData.tokens, 10)).toBe(0);

    const result = await executeMutation('invalid-key');
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].message).toContain('Rate limited');
  });

  it('should replenish one token after an hour', async () => {
    for (let i = 0; i < 10; i++) {
      await executeMutation('invalid-key');
    }

    let result = await executeMutation('invalid-key');
    expect(result.errors?.[0].message).toContain('Rate limited');

    // Advance time by one hour
    jest.advanceTimersByTime(1000 * 60 * 60);

    result = await executeMutation('invalid-key');
    expect(result.errors?.[0].message).toBe('Invalid key');

    const bucketKey = `bucket:${contextValue.user.id}`;
    const bucketData = redisStore[bucketKey];
    expect(parseInt(bucketData.tokens, 10)).toBe(0);
  });

  it('should replenish all tokens after 10 hours', async () => {
    for (let i = 0; i < 10; i++) {
        await executeMutation('invalid-key');
    }

    jest.advanceTimersByTime(1000 * 60 * 60 * 10);

    for (let i = 0; i < 10; i++) {
        const result = await executeMutation('invalid-key');
        expect(result.errors?.[0].message).toBe('Invalid key');
    }

    const bucketKey = `bucket:${contextValue.user.id}`;
    const bucketData = redisStore[bucketKey];
    expect(parseInt(bucketData.tokens, 10)).toBe(0);

    const result = await executeMutation('invalid-key');
    expect(result.errors?.[0].message).toContain('Rate limited');
  });
});
