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
  private readonly config: LeakyBucketConfig;
  private readonly userId: string;
  private readonly bucketKey: string;

  constructor(userId: string, config: LeakyBucketConfig) {
    this.config = config;
    this.userId = userId;
    this.bucketKey = `leaky-bucket:user:${userId}`;
  }

  get bucketConfig(): LeakyBucketConfig {
    return this.config;
  }

  async leakTokens(tokensToConsume: number): Promise<boolean> {
    this.validateTokenAmount(tokensToConsume);

    try {
      const bucket = await this.getBucketOrCreate();
      const updatedBucket = this.refillBucketTokens(bucket);
      
      if (!this.hasEnoughTokens(updatedBucket, tokensToConsume)) {
        await this.saveBucket(updatedBucket);
        return false;
      }

      updatedBucket.tokens -= tokensToConsume;
      await this.saveBucket(updatedBucket);
      return true;
    } catch (error) {
      throw this.wrapError(error, "Failed to consume tokens");
    }
  }

  async refundTokens(tokensToRefund: number): Promise<void> {
    this.validateTokenAmount(tokensToRefund);

    try {
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
      throw this.wrapError(error, "Failed to refund tokens");
    }
  }

  async getCurrentTokens(): Promise<number> {
    try {
      const bucket = await this.getBucketOrCreate();
      const updatedBucket = this.refillBucketTokens(bucket);
      
      // Save the updated bucket with refilled tokens
      await this.saveBucket(updatedBucket);
      
      return updatedBucket.tokens;
    } catch (error) {
      throw this.wrapError(error, "Failed to get current tokens");
    }
  }

  private validateTokenAmount(tokenAmount: number): void {
    if (tokenAmount <= 0) {
      throw new LeakyBucketError(
        `Tokens must be a positive number`,
      );
    }
  }

  /**
   * Gets existing bucket or creates a new one if it doesn't exist.
   */
  private async getBucketOrCreate(): Promise<LeakyBucket> {
    const existingBucket = await this.fetchBucket();
    return existingBucket || await this.createBucket();
  }

  /**
   * Refills tokens in the bucket based on elapsed time.
   */
  private refillBucketTokens(bucket: LeakyBucket): LeakyBucket {
    const currentTimestamp = Date.now();
    const elapsedTimeMs = currentTimestamp - bucket.lastFillTime;
    const tokensToRefill = Math.floor(elapsedTimeMs / this.config.fillIntervalMs);

    if (tokensToRefill > 0) {
      bucket.tokens = Math.min(
        bucket.tokens + tokensToRefill,
        this.config.maxTokens,
      );
      bucket.lastFillTime = currentTimestamp;
    }

    return bucket;
  }

  private hasEnoughTokens(bucket: LeakyBucket, tokensNeeded: number): boolean {
    return bucket.tokens >= tokensNeeded;
  }

  private wrapError(error: unknown, message: string): LeakyBucketError {
    if (error instanceof LeakyBucketError) {
      return error;
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new LeakyBucketError(`${message}: ${errorMessage}`);
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
