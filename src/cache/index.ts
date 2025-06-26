import { createClient } from "redis";
import { redis } from "../config";
import { error, info } from "console";

const redisURL = `redis://:${redis.password}@${redis.host}:${redis.port}`;

const client = createClient({ url: redisURL });

client.on("connect", () => info("Cache is connecting"));
client.on("ready", () => info("Cache is ready"));
client.on("end", () => info("Cache disconnected"));
client.on("reconnecting", () => info("Cache is reconnecting"));
client.on("error", e => error(e));

async function connect(){
    try {
        await client.connect();
    } catch (error) {
        console.error("Redis connecion failed, retrying in 5 seconds");
        setTimeout(connect, 5000);
    }
}

connect();

process.on('SIGINT', async () => {
    await client.disconnect();
})

export default client;