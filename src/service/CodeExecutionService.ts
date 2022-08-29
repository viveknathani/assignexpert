import * as errors from './errors';
import * as entity from '../entity';
import * as jobQueue from '../job-queue';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Job } from 'bullmq';
import util from 'util';
import path from 'path';
import { getClient } from '../cache';
import { ExecException } from 'child_process';

const exec = util.promisify(require('child_process').exec);

export class CodeExecutionService {

    private static instance: CodeExecutionService;
    private static hasAddedWorker: boolean = false;
    private supportedLanguages = new Set(["c", "cpp", "python", "java"]);
    private constructor() {}

     // follows the singleton pattern
    public static getInstance(): CodeExecutionService {

        if (!CodeExecutionService.instance) {
            CodeExecutionService.instance = new CodeExecutionService();
        }

        if (!CodeExecutionService.hasAddedWorker) {
            jobQueue.addWorker(CodeExecutionService.instance.job);
            CodeExecutionService.hasAddedWorker = true;
        }

        return CodeExecutionService.instance;
    }

    public runCode(code: string, language: string, testCases: entity.TestCase[], timeLimit: number, memoryLimit: number) {
        try {
            if (!this.supportedLanguages.has(language)) {
                throw new errors.ErrUnsupportedLanguage;
            }
            // appending the "job-" prefix to the uuid can help
            // in differentiating the uuid from our session-ids during debugging
            const jobId = `job-${uuidv4()}`;
            jobQueue.addJob(jobId, {
                code, language, testCases, timeLimit, memoryLimit
            });
            return jobId;
        } catch (err) {
            throw err;
        }
    }

    public job = async(job: Job) => {

        const data: entity.JobQueueData = job.data;
        const jobId = job.name;
        const executionAreaPath = `./execution-area`;
        const directoryPath = `${executionAreaPath}/${jobId}`;
        const submissionfileName = `submission.${this.getExtension(data.language)}`;
        const inputFileName = "input.txt";
        const dockerFileParent = (process.env.NODE_ENV === 'test') ? `./src` : `./build`;
        const dockerFilePath = `${dockerFileParent}/dockerfiles/${data.language}`;
        const submissionFilePath = path.resolve(`${directoryPath}/${submissionfileName}`);
        const inputFilePath = path.resolve(`${directoryPath}/${inputFileName}`);
        const expectedOutputFilePath = path.resolve(`${directoryPath}/output.txt`);
        const actualOutputFilePath = path.resolve(`${directoryPath}/outputs/submission.txt`);
        const timeOutFilePath = path.resolve(`${directoryPath}/outputs/timeout.txt`);
        
        try {
            await job.updateProgress(entity.JobProgress.STARTED);
            await fs.promises.mkdir(directoryPath);
            await fs.promises.mkdir(`${directoryPath}/outputs`);
            await fs.promises.writeFile(submissionFilePath, data.code, {
                encoding: 'utf-8'
            });
            await fs.promises.writeFile(inputFilePath, this.getFileContent(data.testCases, true), {
                encoding: 'utf-8'
            });
            await fs.promises.writeFile(expectedOutputFilePath, this.getFileContent(data.testCases, false), {
                encoding: 'utf-8'
            });
            await job.updateProgress(entity.JobProgress.MKDIR);
        } catch (err) {
            console.log(err);
            throw errors.ErrJobMkdir;
        }

        try {
            await exec(`docker build -t ${jobId} -f ${dockerFilePath} --build-arg SUBMISSION_FILE_PATH=${jobId}/${submissionfileName} --build-arg INPUT_FILE_PATH=${jobId}/${inputFileName} --build-arg TIME_LIMIT=${data.timeLimit} ${executionAreaPath}`);
            await job.updateProgress(entity.JobProgress.DOCKER_BUILD);
        } catch (err) {
            console.log(err);
            await this.setResultInCache(jobId, {
                resultStatus: entity.ResultStatus.CE,
                resultMessage: err as string 
            })
            throw errors.ErrCodeCompileError;
        }

        try {
            await exec(`docker run -m ${data.memoryLimit} --memory-swap ${data.memoryLimit} --network none -v ${path.resolve(directoryPath)}/outputs:/outputs ${jobId}`);
            await job.updateProgress(entity.JobProgress.DOCKER_RUN);
            
        } catch (err) {
            if (this.isExecException(err)) {
                await this.setResultInCache(jobId, {
                    resultStatus: (err.code === 137) ? entity.ResultStatus.MLE : entity.ResultStatus.RE,
                    resultMessage: err.signal || ""
                });
            }
            await this.setResultInCache(jobId, {
                resultStatus: entity.ResultStatus.RE,
                resultMessage: err as string
            })
            throw errors.ErrRuntimeError;
        }

        try {
            await exec(`docker rmi -f ${jobId}`);
            await job.updateProgress(entity.JobProgress.DOCKER_RMI);
            const tle = await this.hasTimedOut(timeOutFilePath);
            if (tle) {
                await this.setResultInCache(jobId, {
                    resultStatus: entity.ResultStatus.TLE,
                    resultMessage: ""
                });
                throw errors.ErrTimeLimitExceeded;
            }
        } catch (err) {
            console.log(err);
            throw err;
        }

        try {
            
        } catch (err) {
            console.log(err);
            throw err;
        }

        try {
            const diff = await this.processOutputs(actualOutputFilePath, expectedOutputFilePath);
            await this.setResultInCache(jobId, {
                resultStatus: (diff === "") ? entity.ResultStatus.AC : entity.ResultStatus.WA,
                resultMessage: diff
            });
            await job.updateProgress(entity.JobProgress.PROCESS_OUTPUTS);
            await fs.promises.rm(directoryPath, {
                recursive: true,
                force: true
            });
            await job.updateProgress(entity.JobProgress.RM);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    public async getJobResult(jobId: string): Promise<entity.ResultStatus | undefined> {
        try {
            const cacheClient = getClient();
            if (!cacheClient.isOpen) {
                await cacheClient.connect();
            }
            const data = await cacheClient.get(jobId);
            if (data === undefined || data === null) {
                return undefined;
            }
            return JSON.parse(data);
        } catch (err) {
            throw err;
        }
    }

    private async setResultInCache(jobId: string, data: entity.CodeExecutionResult) {
        try {
            const cacheClient = getClient();
            if (!cacheClient.isOpen) {
                await cacheClient.connect();
            }
            await cacheClient.set(jobId, JSON.stringify(data));
        } catch (err) {
            throw err;
        }
    }
    
    private getExtension(language: string): string {
        if (language === "python") {
            return "py";
        }
        return language;
    }

    private getFileContent(testCases: entity.TestCase[], writeInput: boolean): string {
        let result = (writeInput) ? `${testCases.length}\n` : "";
        for (let i = 0; i < testCases.length; ++i) {
            result += (writeInput) ? `${testCases[i].input}\n` : `${testCases[i].output}\n`;
        }
        return result;
    }

    private async processOutputs(actualOutputFile: string, expectedOutputFile: string): Promise<string> {
        try {
            const { stdout, stderr } = await exec(`diff ${actualOutputFile} ${expectedOutputFile} 2>&1`);
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            return stdout;
        } catch (err) {
            return err as string;
        }
        
    }

    private async hasTimedOut(timeOutFilePath: string): Promise<boolean> {
        const data = await fs.promises.readFile(timeOutFilePath, {
            encoding: 'utf-8'
        });
        return (data !== '0\n');
    }

    private isExecException(object: unknown): object is ExecException {
        return Object.prototype.hasOwnProperty.call(object, "code")
        && Object.prototype.hasOwnProperty.call(object, "killed")
        && Object.prototype.hasOwnProperty.call(object, "signals")
        && Object.prototype.hasOwnProperty.call(object, "cmd")
    }
}