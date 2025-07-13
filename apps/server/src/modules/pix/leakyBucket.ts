// Chose to create the leakyBucket implementation in a single file alongside the pix functionality as the
// one currently using it is the pix itself, in the case of a broader use of it i would separate it into granular
// pieces in an individual module

import { redis } from "../../server/redisClient"

export async function useLeakyBucket(userId: string, requestCost: number): Promise<LeakyBucketResult> {
    let bucket = await getOrCreateBucket(userId);

    const now = new Date();
    const differenceInMs = now.getTime() - bucket.lastLeakTime.getTime();
    const tokensRefreshed = Math.floor(differenceInMs / bucket.leakIntervalMs);
    bucket.numberOfTokens = Math.min(bucket.numberOfTokens + tokensRefreshed, bucket.maxTokens);
    bucket.lastLeakTime = new Date(bucket.lastLeakTime.getTime() + tokensRefreshed * bucket.leakIntervalMs);

    if (bucket.numberOfTokens < requestCost) {
        return {
            allowed: false,
            refundToken: async () => {}
        };
    }

    bucket.numberOfTokens -= requestCost;

    await saveBucket(bucket);

    return {
        allowed: true,
        refundToken: async () => {
            bucket.numberOfTokens += requestCost;
            await saveBucket(bucket);
        }
    };
}

async function getOrCreateBucket(userId: string): Promise<Bucket> {
    const bucketKey = `bucket:${userId}`;
    const bucketData = await redis.get(bucketKey);
    
    if (!bucketData) {
        return {
            maxTokens: 10,
            numberOfTokens: 10,
            leakIntervalMs: 1000 * 60 * 60,
            lastLeakTime: new Date(),
            userId
        };
    }

    const parsed = JSON.parse(bucketData);
    return {
        ...parsed,
        lastLeakTime: new Date(parsed.lastLeakTime)
    };
}

async function saveBucket(bucket: Bucket): Promise<void> {
    const bucketKey = `bucket:${bucket.userId}`;
    const bucketData = JSON.stringify({
        ...bucket,
        lastLeakTime: bucket.lastLeakTime?.toISOString()
    });
    
    await redis.set(bucketKey, bucketData);
}

interface Bucket {
    maxTokens: number;
    numberOfTokens: number;
    leakIntervalMs: number;
    lastLeakTime: Date;
    userId: string;
}

interface LeakyBucketResult {
    allowed: boolean;
    refundToken: () => Promise<void>;
}
