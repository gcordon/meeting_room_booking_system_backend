import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

// Redis服务类，用于处理Redis操作
@Injectable()
export class RedisService {
    // 注入Redis客户端
    @Inject('REDIS_CLIENT')
    private redisClient: RedisClientType

    // 获取指定键的值
    async get(key: string) {
        return await this.redisClient.get(key)
    }

    // 设置键值对，可选设置过期时间
    async set(key: string, value: string | number, ttl?: number) {
        // 设置键值对
        await this.redisClient.set(key, value)
        // 如果提供了过期时间，则设置键的过期时间
        if (ttl) {
            await this.redisClient.expire(key, ttl)
        }
    }
}
