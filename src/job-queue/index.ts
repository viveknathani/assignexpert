import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import * as entity from '../entity';

const redisConnection = new IORedis(process.env.REDIS_URL || "");

const queue = new Queue('assignexpert', {
    connection: redisConnection
});

export function addJob(jobId: string, data: entity.JobQueueData) {
    queue.add(jobId, data);
}

export function addWorker(job: (job: Job) => Promise<void>) {
    const worker = new Worker('assignexpert', job, {
        connection: redisConnection
    });
}
