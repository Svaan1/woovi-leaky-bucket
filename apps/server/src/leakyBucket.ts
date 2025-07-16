import { redis } from "./redis";

export interface LeakyBucket {
  tokens: number;
  lastFillTime: number;
}
export interface LeakyBucketConfig {
  fillIntervalMs: number;
  maxTokens: number;
  bucketTtlSeconds: number;
}

class LeakyBucketError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeakyBucketError";
  }
}

export class LeakyBucketService {
  private config: LeakyBucketConfig;
  private userId: string;
  private bucketKey: string;

  constructor(userId: string, config: LeakyBucketConfig) {
    this.config = config;
    this.userId = userId;
    this.bucketKey = `leaky-bucket:user:${userId}`;
  }

  async leakTokens(tokensToConsume: number): Promise<boolean> {
    try {
      if (tokensToConsume <= 0) {
        throw new LeakyBucketError(
          "Tokens to consume must be a positive number",
        );
      }

      let bucket = await this.fetchBucket();

      if (!bucket) {
        bucket = await this.createBucket();
      }

      console.log(bucket);

      const currentTimestamp = Date.now();
      const elapsedTimeMs = currentTimestamp - bucket.lastFillTime;
      const tokensToRefill = Math.floor(
        elapsedTimeMs / this.config.fillIntervalMs,
      );

      if (tokensToRefill > 0) {
        bucket.tokens = Math.min(
          bucket.tokens + tokensToRefill,
          this.config.maxTokens,
        );
        bucket.lastFillTime = currentTimestamp;
      }

      if (bucket.tokens < tokensToConsume) {
        await this.saveBucket(bucket);
        return false;
      }

      bucket.tokens -= tokensToConsume;
      await this.saveBucket(bucket);
      return true;
    } catch (error) {
      if (error instanceof LeakyBucketError) {
        throw error;
      }
      throw new LeakyBucketError(
        `Failed to consume tokens: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async refundTokens(tokensToRefund: number): Promise<void> {
    try {
      if (tokensToRefund <= 0) {
        throw new LeakyBucketError(
          "Tokens to refund must be a positive number",
        );
      }

      const bucket = await this.fetchBucket();

      if (!bucket) {
        throw new LeakyBucketError(
          `Cannot refund tokens: Bucket for user ${this.userId} does not exist.`,
        );
      }

      bucket.tokens = Math.min(
        bucket.tokens + tokensToRefund,
        this.config.maxTokens,
      );
      await this.saveBucket(bucket);
    } catch (error) {
      if (error instanceof LeakyBucketError) {
        throw error;
      }
      throw new LeakyBucketError(
        `Failed to refund tokens: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async fetchBucket(): Promise<LeakyBucket | null> {
    const bucketData = await redis.hgetall(this.bucketKey);

    if (Object.keys(bucketData).length === 0) {
      return null;
    }

    return {
      tokens: parseInt(bucketData.tokens, 10),
      lastFillTime: parseInt(bucketData.lastFillTime, 10),
    };
  }

  private async createBucket(): Promise<LeakyBucket> {
    const newBucket: LeakyBucket = {
      tokens: this.config.maxTokens,
      lastFillTime: Date.now(),
    };

    await this.saveBucket(newBucket);
    return newBucket;
  }

  private async saveBucket(bucket: LeakyBucket): Promise<void> {
    await redis.hset(this.bucketKey, {
      tokens: bucket.tokens.toString(),
      lastFillTime: bucket.lastFillTime.toString(),
    });

    await redis.expire(this.bucketKey, this.config.bucketTtlSeconds);
  }
}
