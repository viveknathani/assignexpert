import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import * as entity from '../entity';

const redisConnection = new IORedis(process.env.REDIS_URL || "", {
    maxRetriesPerRequest: null
});

const queue = new Queue('assignexpert', {
    connection: redisConnection
});

export function addJob(jobId: string, data: entity.JobQueueData) {
    queue.add(jobId, data, {
        jobId
    });
}

export function addWorker(job: (job: Job) => Promise<void>) {
    const worker = new Worker('assignexpert', job, {
        connection: redisConnection
    });

    worker.on('error', (err) => {
        console.log(`error: ${job.name} - ${err.message}`);
    });

    worker.on('failed', (job) => {
        console.log(`failed: ${job.name}`);
    });

    worker.on('completed', async (job) => {
        try {
            console.log(`done: ${job.name}`);
        } catch (err) {
            console.log(err);
        }
    });

    worker.on('active', (job) => {
        console.log(`starting: ${job.name}`);
    });
}

export async function getJobProgress(jobId: string): Promise<number> {
    try {
        const job = await queue.getJob(jobId);
        if (!job || typeof job.progress !== 'number') {
            return -1;
        }
        return job.progress;
    } catch (err) {
        throw err;
    }
}
