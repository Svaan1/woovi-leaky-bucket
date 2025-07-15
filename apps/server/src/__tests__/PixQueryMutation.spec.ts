import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { graphql } from 'graphql';
import { schema } from '../schema/schema';
import { redis } from '../redis';
import { toGlobalId, fromGlobalId } from 'graphql-relay';
import { LeakyBucketService } from '../leakyBucket';

jest.mock('../redis');

const mockedRedis = redis as jest.Mocked<typeof redis>;

describe('PixTransactionMutation with Leaky Bucket', () => {
    let redisStore: { [key: string]: { tokens: string; lastFillTime: string } } = {};
    
    const USER_ID = '1';
    const VALID_PIX_KEY = 'valid-key';
    const INVALID_PIX_KEY = 'invalid-key';
    const BUCKET_KEY = `leaky-bucket:user:${USER_ID}`;

    const config = {
        maxTokens: 10,
        fillIntervalMs: 1000 * 60 * 60, // 1 hour
        bucketTtlSeconds: 60 * 60 * 24 * 7, // 1 week
    };

    const leakyBucket = new LeakyBucketService(USER_ID, config);

    const contextValue = {
        user: {
            id: toGlobalId('User', USER_ID),
        },
        leakyBucket,
    };

    const executeMutation = (pixKey: string) => {
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
                clientMutationId: 'some-client-mutation-id',
            },
        };
        return graphql({ schema, source, variableValues, contextValue });
    };

    const getBucketData = () => redisStore[BUCKET_KEY];

    const assertTokenCount = (expectedCount: number) => {
        const bucketData = getBucketData();
        expect(parseInt(bucketData.tokens, 10)).toBe(expectedCount);
    };

    beforeEach(() => {
        redisStore = {};
        
        mockedRedis.hgetall.mockImplementation((key: string | Buffer) => Promise.resolve(redisStore[key.toString()] || {}));
        
        mockedRedis.hset.mockImplementation((key: string | Buffer, value: any) => {
            const keyStr = key.toString();
            if (!redisStore[keyStr]) {
                redisStore[keyStr] = { tokens: '', lastFillTime: '' };
            }
            Object.assign(redisStore[keyStr], value);
            return Promise.resolve(1);
        });
        
        (mockedRedis.expire as jest.Mock).mockImplementation(() => Promise.resolve(1));
        
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should refund tokens on a successful transaction', async () => {
        const result = await executeMutation(VALID_PIX_KEY);
        expect(result.errors).toBeUndefined();
        assertTokenCount(10);
    });

    it('should consume one token on a failed transaction', async () => {
        const result = await executeMutation(INVALID_PIX_KEY);
        expect(result.errors).toBeDefined();
        expect(result.errors?.[0].message).toBe('Invalid key');
        assertTokenCount(9);
    });

    it('should become rate-limited after 10 failed transactions', async () => {
        for (let i = 0; i < 10; i++) {
            await executeMutation(INVALID_PIX_KEY);
        }
        assertTokenCount(0);

        const result = await executeMutation(INVALID_PIX_KEY);
        expect(result.errors).toBeDefined();
        expect(result.errors?.[0].message).toContain('Rate limited');
    });

    it('should replenish one token after one hour', async () => {
        for (let i = 0; i < 10; i++) {
            await executeMutation(INVALID_PIX_KEY);
        }
        
        let result = await executeMutation(INVALID_PIX_KEY);
        expect(result.errors?.[0].message).toContain('Rate limited');

        jest.advanceTimersByTime(1000 * 60 * 60);

        result = await executeMutation(INVALID_PIX_KEY);
        expect(result.errors?.[0].message).toBe('Invalid key');
        assertTokenCount(0);
    });

    it('should replenish all tokens after 10 hours', async () => {
        for (let i = 0; i < 10; i++) {
            await executeMutation(INVALID_PIX_KEY);
        }

        jest.advanceTimersByTime(1000 * 60 * 60 * 10);

        for (let i = 0; i < 10; i++) {
            const result = await executeMutation(INVALID_PIX_KEY);
            expect(result.errors?.[0].message).toBe('Invalid key');
        }
        assertTokenCount(0);

        const result = await executeMutation(INVALID_PIX_KEY);
        expect(result.errors?.[0].message).toContain('Rate limited');
    });
});
