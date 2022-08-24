import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { CodeExecutionService } from '../service/.';
import * as entity from '../entity';

const redisConnection = new IORedis(process.env.REDIS_URL || "");

const queue = new Queue('assignexpert', {
    connection: redisConnection
});

const codeExecutionService: CodeExecutionService = CodeExecutionService.getInstance();
const worker = new Worker('assignexpert', codeExecutionService.job);

export function addJob(jobId: string, data: entity.JobQueueData) {
    queue.add(jobId, data);
}
