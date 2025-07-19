import type { Redis } from 'ioredis'

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

  private redis: Redis;

  // Lua script for atomic token consumption
  private readonly consumeTokensScript = `
    local bucketKey = KEYS[1]
    local tokensToConsume = tonumber(ARGV[1])
    local fillIntervalMs = tonumber(ARGV[2])
    local maxTokens = tonumber(ARGV[3])
    local bucketTtlSeconds = tonumber(ARGV[4])
    local currentTime = tonumber(ARGV[5])
    
    -- Get current bucket state
    local bucketData = redis.call('HMGET', bucketKey, 'tokens', 'lastFillTime')
    local tokens = tonumber(bucketData[1])
    local lastFillTime = tonumber(bucketData[2])
    
    -- Initialize bucket if it doesn't exist
    if not tokens or not lastFillTime then
      tokens = maxTokens
      lastFillTime = currentTime
    end
    
    -- Calculate refill
    local elapsedTimeMs = currentTime - lastFillTime
    local tokensToRefill = math.floor(elapsedTimeMs / fillIntervalMs)
    
    if tokensToRefill > 0 then
      tokens = math.min(tokens + tokensToRefill, maxTokens)
      lastFillTime = currentTime
    end
    
    -- Check if we have enough tokens
    if tokens < tokensToConsume then
      -- Save updated bucket state even if we can't consume
      redis.call('HMSET', bucketKey, 'tokens', tokens, 'lastFillTime', lastFillTime)
      redis.call('EXPIRE', bucketKey, bucketTtlSeconds)
      return {0, tokens} -- {success: false, remainingTokens}
    end
    
    -- Consume tokens
    tokens = tokens - tokensToConsume
    
    -- Save updated bucket state
    redis.call('HMSET', bucketKey, 'tokens', tokens, 'lastFillTime', lastFillTime)
    redis.call('EXPIRE', bucketKey, bucketTtlSeconds)
    
    return {1, tokens} -- {success: true, remainingTokens}
  `;

  // Lua script for atomic token refund
  private readonly refundTokensScript = `
    local bucketKey = KEYS[1]
    local tokensToRefund = tonumber(ARGV[1])
    local maxTokens = tonumber(ARGV[2])
    local bucketTtlSeconds = tonumber(ARGV[3])
    
    -- Get current bucket state
    local bucketData = redis.call('HMGET', bucketKey, 'tokens', 'lastFillTime')
    local tokens = tonumber(bucketData[1])
    local lastFillTime = tonumber(bucketData[2])
    
    -- Bucket must exist for refund
    if not tokens or not lastFillTime then
      return {0} -- {success: false}
    end
    
    -- Refund tokens (capped at maxTokens)
    tokens = math.min(tokens + tokensToRefund, maxTokens)
    
    -- Save updated bucket state
    redis.call('HMSET', bucketKey, 'tokens', tokens, 'lastFillTime', lastFillTime)
    redis.call('EXPIRE', bucketKey, bucketTtlSeconds)
    
    return {1, tokens} -- {success: true, remainingTokens}
  `;

  // Lua script for getting current tokens (with refill)
  private readonly getCurrentTokensScript = `
    local bucketKey = KEYS[1]
    local fillIntervalMs = tonumber(ARGV[1])
    local maxTokens = tonumber(ARGV[2])
    local bucketTtlSeconds = tonumber(ARGV[3])
    local currentTime = tonumber(ARGV[4])
    
    -- Get current bucket state
    local bucketData = redis.call('HMGET', bucketKey, 'tokens', 'lastFillTime')
    local tokens = tonumber(bucketData[1])
    local lastFillTime = tonumber(bucketData[2])
    
    -- Initialize bucket if it doesn't exist
    if not tokens or not lastFillTime then
      tokens = maxTokens
      lastFillTime = currentTime
    end
    
    -- Calculate refill
    local elapsedTimeMs = currentTime - lastFillTime
    local tokensToRefill = math.floor(elapsedTimeMs / fillIntervalMs)
    
    if tokensToRefill > 0 then
      tokens = math.min(tokens + tokensToRefill, maxTokens)
      lastFillTime = currentTime
    end
    
    -- Save updated bucket state
    redis.call('HMSET', bucketKey, 'tokens', tokens, 'lastFillTime', lastFillTime)
    redis.call('EXPIRE', bucketKey, bucketTtlSeconds)
    
    return tokens
  `;

  constructor(userId: string, config: LeakyBucketConfig, redis: Redis) {
    this.config = config;
    this.userId = userId;
    this.redis = redis;
    this.bucketKey = `leaky-bucket:user:${userId}`;
  }

  async leakTokens(tokensToConsume: number): Promise<boolean> {
    this.validateTokenAmount(tokensToConsume);

    try {
      const result = await this.redis.eval(
        this.consumeTokensScript,
        1, // number of keys
        this.bucketKey,
        tokensToConsume.toString(),
        this.config.fillIntervalMs.toString(),
        this.config.maxTokens.toString(),
        this.config.bucketTtlSeconds.toString(),
        Date.now().toString()
      ) as [number, number];

      const [success] = result;
      return success === 1;
    
    } catch (error) {
      throw this.wrapError(error, "Failed to consume tokens");
    }
  }

  async refundTokens(tokensToRefund: number): Promise<void> {
    this.validateTokenAmount(tokensToRefund);

    try {
      const result = await this.redis.eval(
        this.refundTokensScript,
        1, // number of keys
        this.bucketKey,
        tokensToRefund.toString(),
        this.config.maxTokens.toString(),
        this.config.bucketTtlSeconds.toString()
      ) as [number, number?];

      const [success] = result;

      if (success === 0) {
        throw new LeakyBucketError(
          `Cannot refund tokens: Bucket for user ${this.userId} does not exist.`
        );
      }

    } catch (error) {
      throw this.wrapError(error, "Failed to refund tokens");
    }
  }

  async getCurrentTokens(): Promise<number> {
    try {
      const result = await this.redis.eval(
        this.getCurrentTokensScript,
        1, // number of keys
        this.bucketKey,
        this.config.fillIntervalMs.toString(),
        this.config.maxTokens.toString(),
        this.config.bucketTtlSeconds.toString(),
        Date.now().toString()
      ) as number;

      return result;

    } catch (error) {
      throw this.wrapError(error, "Failed to get current tokens");
    }
  }

  private validateTokenAmount(tokenAmount: number): void {
    if (tokenAmount <= 0) {
      throw new LeakyBucketError(
        `Tokens must be a positive number`
      );
    }
  }

  private wrapError(error: unknown, message: string): LeakyBucketError {
    if (error instanceof LeakyBucketError) {
      return error;
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new LeakyBucketError(`${message}: ${errorMessage}`);
  }
}