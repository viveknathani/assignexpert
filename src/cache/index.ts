import { createClient, RedisClientType } from 'redis';

let client: RedisClientType<any>;

// Take the redisURL in form of [localhost]:[password] and use it
// to create the Redis client. If username and password are non-empty,
// they are used with the URL too.
export function setupCache(redisURL: string, username: string, password: string) {

    let auth = '';
    if (username !== '' && password !== '') {
        auth = `${username}:${password}@`;
    }

    client = createClient({
        url: `redis://${auth}${redisURL}`
    });
}

// Return the instance of the client we have.
// Use it after you have called setupCache.
// Usage:
//    const client = getClient();
//    await client.connect();
//    await client.set('key', 'value');
export function getClient(): RedisClientType<any> {
    return client;
}