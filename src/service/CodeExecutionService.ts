import * as errors from './errors';
import * as entity from '../entity';
import * as jobQueue from '../job-queue';
import { v4 as uuidv4 } from 'uuid';
import { Job } from 'bullmq';

export class CodeExecutionService {

    private static instance: CodeExecutionService;
    private supportedLanguages = new Set(["c", "cpp", "python", "java"]);
    private constructor() {}

     // follows the singleton pattern
     public static getInstance(): CodeExecutionService {

        if (!CodeExecutionService.instance) {
            CodeExecutionService.instance = new CodeExecutionService();
        }

        return CodeExecutionService.instance;
    }

    public async runCode(code: string, language: string, testCases: entity.TestCase[]) {
        try {
            if (!this.supportedLanguages.has(language)) {
                throw new errors.ErrUnsupportedLanguage;
            }
            const jobId = uuidv4();
            jobQueue.addJob(jobId, {
                code, language, testCases
            });
        } catch (err) {
            throw err;
        }
    }

    public async job(job: Job) {
        const data: entity.JobQueueData = job.data;
    }

    public async getJobResult(jobId: string) {

    }
}