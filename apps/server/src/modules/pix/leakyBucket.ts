// I chose to create the leakyBucket implementation in a single file alongside the pix functionality as the
// one currently using it is the pix itself. In the case of a broader use of it, I would separate it into granular
// pieces in an individual module.

// I tried my best to not overcomplicate this and used a Redis hash so I can make atomic changes with HSET.
// This could be achieved in other ways, but I felt this was the simplest and offered no major drawbacks.

import { redis } from "../../redis";

const FILL_INTERVAL_MS = 1000 * 60 * 60 // 1 hour in ms
const MAX_TOKENS = 10;

interface LeakyBucket {
    tokens: number;
    lastFillTime: number;
}

export async function leakTokens(userId: string, tokensToConsume: number): Promise<boolean> {
    const bucket = await getOrCreateBucket(userId);

    const now = Date.now();
    const elapsedTime = now - bucket.lastFillTime;
    const tokensToAdd = Math.floor(elapsedTime / FILL_INTERVAL_MS);

    if (tokensToAdd > 0) {
        bucket.tokens = Math.min(bucket.tokens + tokensToAdd, MAX_TOKENS);
        bucket.lastFillTime = now;
    }

    if (bucket.tokens < tokensToConsume) {
        await saveBucket(userId, bucket);
        return false;
    }

    bucket.tokens -= tokensToConsume;
    await saveBucket(userId, bucket);
    return true;
}

export async function refundTokens(userId: string, tokensToRefund: number): Promise<void> {
    const bucket = await getBucket(userId);

    if (!bucket) {
        throw new Error(`Cannot refund tokens: Bucket for user ${userId} does not exist.`);
    }

    bucket.tokens = Math.min(bucket.tokens + tokensToRefund, MAX_TOKENS);
    await saveBucket(userId, bucket);
}

async function getOrCreateBucket(userId: string): Promise<LeakyBucket> {
    const bucket = await getBucket(userId);

    if (bucket) {
        return bucket;
    }

    const newBucket: LeakyBucket = {
        tokens: MAX_TOKENS,
        lastFillTime: Date.now(),
    };
    await saveBucket(userId, newBucket);
    return newBucket;
}

async function getBucket(userId: string): Promise<LeakyBucket | null> {
    const bucketKey = `bucket:${userId}`;
    const bucketData = await redis.hgetall(bucketKey);

    if (!bucketData || !bucketData.tokens || !bucketData.lastFillTime) {
        return null;
    }

    return {
        tokens: parseInt(bucketData.tokens, 10),
        lastFillTime: parseInt(bucketData.lastFillTime, 10),
    };
}

async function saveBucket(userId: string, bucket: LeakyBucket): Promise<void> {
    const bucketKey = `bucket:${userId}`;

    await redis.hset(bucketKey, {
        tokens: bucket.tokens.toString(),
        lastFillTime: bucket.lastFillTime.toString(),
    });
}