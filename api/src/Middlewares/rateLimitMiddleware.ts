import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis from '../models/redis.ts';

function createRedisStore(prefix: string) {
    return new RedisStore({
        sendCommand: (...args: Array<string>) => redis.sendCommand(args),
        prefix
    });
};

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    limit: 300, // 300 requêtes par ip dans cette fenêtre
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    store: createRedisStore('rl:api:'),
    message: {
        error: 'Too many requests, please try again later'
    }
});

export const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    limit: 10, // 10 requêtes par ip dans cette fenêtre
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    store: createRedisStore('rl:auth:'),
    skipSuccessfulRequests: true,
    message: {
        error: 'Too many requests, please try again later'
    }
});