import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import * as entity from '../entity';

const redisConnection = new IORedis(process.env.REDIS_URL || "", {
    maxRetriesPerRequest: null
});

// Queues
const executionQueue = new Queue('assignexpert-execution', {
    connection: redisConnection
});

const emailQueue = new Queue('assignexpert-email', {
    connection: redisConnection
});

// Workers
export function addExecutionWorker(job: (job: Job) => Promise<void>) {
    const worker = new Worker('assignexpert-execution', job, {
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

export function addEmailWorker(job: (job: Job) => Promise<void>) {
    const worker = new Worker('assignexpert-email', job, {
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

// Jobs
export function addExecutionJob(jobId: string, data: entity.CodeExecutionInput) {
    executionQueue.add(jobId, data, {
        jobId
    });
}

export function addEmailJob(jobId: string, data: entity.Email) {
    emailQueue.add(jobId, data, {
        jobId
    });
}

