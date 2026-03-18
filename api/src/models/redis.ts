import { createClient } from 'redis';

// Création et connexion à une base Redis
const redis = createClient({
    url: process.env.REDIS_URL ?? 'redis://localhost:6379'
});

await redis.connect();

export default redis;
