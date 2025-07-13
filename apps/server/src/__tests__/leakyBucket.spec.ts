import { useLeakyBucket } from '../modules/pix/leakyBucket';
import { redis } from '../server/redisClient';

jest.mock('../server/redisClient', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

const mockedRedis = redis as jest.Mocked<typeof redis>;

describe('useLeakyBucket', () => {
  beforeEach(() => {
    mockedRedis.get.mockClear();
    mockedRedis.set.mockClear();
  });

  const userId = 'test-user';
  const requestCost = 1;

  it('should allow requests if tokens are available', async () => {
    mockedRedis.get.mockResolvedValue(null);

    const result = await useLeakyBucket(userId, requestCost);

    expect(result.allowed).toBe(true);
    expect(mockedRedis.set).toHaveBeenCalledWith(
      `bucket:${userId}`,
      expect.stringContaining('"numberOfTokens":9'),
    );
  });

  it('should refund token on success', async () => {
    mockedRedis.get.mockResolvedValue(null);

    const result = await useLeakyBucket(userId, requestCost);
    await result.refundToken();

    expect(mockedRedis.set).toHaveBeenCalledTimes(2);
    const finalBucketState = JSON.parse(mockedRedis.set.mock.calls[1][1] as string);
    expect(finalBucketState.numberOfTokens).toBe(10);
  });

  it('should consume token on failure (no refund)', async () => {
    mockedRedis.get.mockResolvedValue(null);

    await useLeakyBucket(userId, requestCost);

    expect(mockedRedis.set).toHaveBeenCalledTimes(1);
    const finalBucketState = JSON.parse(mockedRedis.set.mock.calls[0][1] as string);
    expect(finalBucketState.numberOfTokens).toBe(9);
  });

  it('should deny request if not enough tokens', async () => {
    const bucket = {
      maxTokens: 10,
      numberOfTokens: 0,
      leakIntervalMs: 3600000,
      lastLeakTime: new Date().toISOString(),
      userId,
    };
    mockedRedis.get.mockResolvedValue(JSON.stringify(bucket));

    const result = await useLeakyBucket(userId, requestCost);

    expect(result.allowed).toBe(false);
  });

  it('should add a token every hour', async () => {
    const oneHourAgo = new Date(Date.now() - 3600000);
    const bucket = {
      maxTokens: 10,
      numberOfTokens: 5,
      leakIntervalMs: 3600000,
      lastLeakTime: oneHourAgo.toISOString(),
      userId,
    };
    mockedRedis.get.mockResolvedValue(JSON.stringify(bucket));

    await useLeakyBucket(userId, requestCost);

    const finalBucketState = JSON.parse(mockedRedis.set.mock.calls[0][1] as string);

    // 5 (original) + 1 (leaked) - 1 (cost) = 5
    expect(finalBucketState.numberOfTokens).toBe(5);
  });

  it('should not exceed max tokens', async () => {
    const oneHourAgo = new Date(Date.now() - 3600000 * 5);
    const bucket = {
      maxTokens: 10,
      numberOfTokens: 8,
      leakIntervalMs: 3600000,
      lastLeakTime: oneHourAgo.toISOString(),
      userId,
    };
    mockedRedis.get.mockResolvedValue(JSON.stringify(bucket));

    await useLeakyBucket(userId, requestCost);

    const finalBucketState = JSON.parse(mockedRedis.set.mock.calls[0][1] as string);

    // 8 (original) + 5 (leaked) = 13, capped at 10. 10 - 1 (cost) = 9
    expect(finalBucketState.numberOfTokens).toBe(9);
  });

  it('should handle multiple requests correctly', async () => {
    mockedRedis.get.mockResolvedValue(null);

    let result = await useLeakyBucket(userId, requestCost);
    expect(result.allowed).toBe(true);
    await result.refundToken();

    let bucketState = JSON.parse(mockedRedis.set.mock.calls[1][1] as string);
    expect(bucketState.numberOfTokens).toBe(10);
    mockedRedis.get.mockResolvedValue(JSON.stringify(bucketState));

    result = await useLeakyBucket(userId, requestCost);
    expect(result.allowed).toBe(true);

    bucketState = JSON.parse(mockedRedis.set.mock.calls[2][1] as string);
    expect(bucketState.numberOfTokens).toBe(9);
  });
});
