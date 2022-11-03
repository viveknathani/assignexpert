import * as errors from './errors';
import * as entity from '../entity';
import * as jobQueue from '../job-queue';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Job } from 'bullmq';
import util from 'util';
import path from 'path';
import { getClient } from '../cache';
import { ExecException, exec as _exec } from 'child_process';

const exec = util.promisify(_exec);

export class CodeExecutionService {

    private static instance: CodeExecutionService;
    private static hasAddedWorker = false;
    private supportedLanguages = new Set(["c", "cpp", "python", "java"]);
    private constructor() {}

     // follows the singleton pattern
    public static getInstance(): CodeExecutionService {

        if (!CodeExecutionService.instance) {
            CodeExecutionService.instance = new CodeExecutionService();
        }

        if (!CodeExecutionService.hasAddedWorker) {
            jobQueue.addExecutionWorker(CodeExecutionService.instance.job);
            CodeExecutionService.hasAddedWorker = true;
        }

        return CodeExecutionService.instance;
    }

    public runCode(codeExecutionInput: entity.CodeExecutionInput): string {

        if (!this.supportedLanguages.has(codeExecutionInput.language)) {
            throw new errors.ErrUnsupportedLanguage;
        }

        let jobId = ''; 
        if (codeExecutionInput.customJobId) {
            if (!codeExecutionInput.customJobId.startsWith("job-")) {
                throw new errors.ErrInvalidJobId;
            }
            jobId = codeExecutionInput.customJobId;
        } else {
            jobId = `job-${uuidv4()}`;
        }
        
        jobQueue.addExecutionJob(jobId, codeExecutionInput);
        return jobId;
    }

    public job = async(job: Job) => {

        try {
            if (!job.id) {
                throw new errors.ErrInvalidJobId;
            }
            const data: entity.CodeExecutionInput = job.data;
            const executionAreaPath = `./execution-area`;
            const directoryPath = `${executionAreaPath}/${job.id}`;
            const submissionFilePath = `${directoryPath}/${this.getFileName(data.language)}`;
            data.timeLimitSeconds = Math.min(data.timeLimitSeconds, 10); // 10 seconds
            data.memoryLimitMB = Math.min(data.memoryLimitMB, 1024); // 1GB
    
            await this.setupDirectory(directoryPath, submissionFilePath, data);
            await this.createContainer(data, directoryPath, job.id);
            const outputs = await this.runContainer(data, directoryPath, job.id);
            await this.setResultInCache(job.id, outputs);
            await this.destoryEverything(job.id, directoryPath);
        } catch (err) {
            throw err;
        }
    }

    private async setupDirectory(directoryPath: string, submissionFilePath: string, 
        data: entity.CodeExecutionInput) {
            try {
                await fs.promises.mkdir(directoryPath);
                await fs.promises.writeFile(submissionFilePath, data.code, {
                    encoding: 'utf-8'
                });
                if (data.executionType === 'judge') {
                    const promises = [];
                    for (let i = 0; i < data.testCases.length; ++i) {
                        const inputFilePath = `${directoryPath}/input${i+1}.txt`;
                        const promise = fs.promises.writeFile(inputFilePath, data.testCases[i].input + '\n', {
                            encoding: 'utf-8'
                        });
                        promises.push(promise);
                    }
                    await Promise.all(promises);
                } else {
                    const inputFilePath = `${directoryPath}/input1.txt`;
                    await fs.promises.writeFile(inputFilePath, data.inputForRun, {
                        encoding: 'utf-8'
                    });
                }
            } catch (err) {
                console.log(err);
                throw errors.ErrJobMkdir;
            } 
    }

    private async createContainer(data: entity.CodeExecutionInput, directoryPath: string, jobId: string) {
        try {
            const tcCount = (data.executionType === 'judge') ? data.testCases.length : 1;
            await exec(`docker create -m ${data.memoryLimitMB}m --memory-swap ${data.memoryLimitMB}m --network none -e TIME_LIMIT=${data.timeLimitSeconds} -e TC_COUNT=${tcCount} --name ${jobId} -v ${path.resolve(directoryPath)}:/ae assignexpert-${data.language}`);
        } catch (err) {
            console.log(err);
            throw errors.ErrNoContainerCreate;
        }
    }

    private async runContainer(data: entity.CodeExecutionInput, directoryPath: string, jobId: string): Promise<entity.CodeExecutionOutput[]> {
        const defaultOutput: entity.CodeExecutionOutput = {
            timeTakenMilliSeconds: 0,
            memoryUsedKB: 0,
            resultStatus: entity.ResultStatus.NA,
            resultMessage: ''
        };
        const outputs = [];
        try {
            await exec(`docker start -a ${jobId}`);
            const compilationFileContent = await fs.promises.readFile(`${directoryPath}/compile.txt`, {
                encoding: 'utf-8'
            });
            if (compilationFileContent !== "") {
                defaultOutput.resultStatus = entity.ResultStatus.CE;
                defaultOutput.resultMessage = compilationFileContent;
                outputs.push(defaultOutput);
                throw errors.ErrCodeCompileError;
            }
            if (data.executionType === 'judge') {
                for (let i = 0; i < data.testCases.length; ++i) {
                    const output = {...defaultOutput};
                    const runTimeFilePath = `${directoryPath}/runtime${i+1}.txt`;
                    const runTimeFileContent = await fs.promises.readFile(runTimeFilePath, {
                        encoding: 'utf-8'
                    });
                    if (runTimeFileContent !== "") {
                        output.resultStatus = entity.ResultStatus.RE;
                        output.resultMessage = runTimeFileContent;
                        throw errors.ErrRuntimeError;
                    }
                    const timeoutFileContent = await fs.promises.readFile(`${directoryPath}/timeout${i+1}.txt`, {
                        encoding: 'utf-8'
                    });
                    if (timeoutFileContent !== "0\n") {
                        output.resultStatus = entity.ResultStatus.TLE;
                        output.resultMessage = "Time limit exceeded.";
                        throw errors.ErrTimeLimitExceeded;
                    }
                    const submissionOutput = await fs.promises.readFile(`${directoryPath}/submission${i+1}.txt`, {
                        encoding: 'utf-8'
                    });
                    if (!(submissionOutput === (data.testCases[i].output) || submissionOutput === (data.testCases[i].output + '\n') || submissionOutput + '\n' === (data.testCases[i].output))) {
                        output.resultStatus = entity.ResultStatus.WA;
                        output.resultMessage = "Wrong answer";
                    } else {
                        output.resultStatus = entity.ResultStatus.AC;
                        output.resultMessage = "";
                    }
                    const statsFileContent = await fs.promises.readFile(`${directoryPath}/stats${i+1}.txt`, {
                        encoding: 'utf-8'
                    });
                    const stats = statsFileContent.split("-");
                    output.memoryUsedKB = parseFloat(stats[0]) / 4.0;
                    output.timeTakenMilliSeconds = parseFloat(stats[1]) * 1000.0;
                    outputs.push(output);
                }
            } else {
                const output = {...defaultOutput};
                const runTimeFilePath = `${directoryPath}/runtime1.txt`;
                const runTimeFileContent = await fs.promises.readFile(runTimeFilePath, {
                    encoding: 'utf-8'
                });
                if (runTimeFileContent !== "") {
                    output.resultStatus = entity.ResultStatus.RE;
                    output.resultMessage = runTimeFileContent;
                    throw errors.ErrRuntimeError;
                }
                const timeoutFileContent = await fs.promises.readFile(`${directoryPath}/timeout1.txt`, {
                    encoding: 'utf-8'
                });
                if (timeoutFileContent !== "0\n") {
                    output.resultStatus = entity.ResultStatus.TLE;
                    output.resultMessage = "Time limit exceeded.";
                    throw errors.ErrTimeLimitExceeded;
                }
                const submissionOutput = await fs.promises.readFile(`${directoryPath}/submission1.txt`, {
                    encoding: 'utf-8'
                });
                output.resultStatus = entity.ResultStatus.AC;
                output.resultMessage = submissionOutput;
                const statsFileContent = await fs.promises.readFile(`${directoryPath}/stats1.txt`, {
                    encoding: 'utf-8'
                });
                const stats = statsFileContent.split("-");
                output.memoryUsedKB = parseFloat(stats[0]) / 4.0;
                output.timeTakenMilliSeconds = parseFloat(stats[1]) * 1000.0;
                outputs.push(output);
            }
        } catch (err) {
            console.log(err);
            if (this.isExecException(err)) {
                const MLE_CODE = 137;
                if (err.code === MLE_CODE) {
                    const output = {...defaultOutput};
                    output.resultStatus = entity.ResultStatus.MLE;
                    output.resultMessage = "Memory limit exceeded."
                    outputs.push(output);
                }
            }
        }
        return outputs;
    }

    private async setResultInCache(jobId: string, data: entity.CodeExecutionOutput[]) {
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

    private async destoryEverything(jobId: string, directoryPath: string) {
        await exec(`docker rm ${jobId}`);
        await fs.promises.rm(directoryPath, {
            recursive: true,
            force: true
        });
    }

    private getFileName(language: string): string {
        if (language === "python") {
            return "submission.py";
        }
        if (language === "java") {
            return "Submission.java";
        }
        return `submission.${language}`;
    }

    private isExecException(object: unknown): object is ExecException {
        return Object.prototype.hasOwnProperty.call(object, "code")
        && Object.prototype.hasOwnProperty.call(object, "killed")
        && Object.prototype.hasOwnProperty.call(object, "cmd")
    }

    public async getJobResult(jobId: string): Promise<entity.CodeExecutionOutput[] | undefined> {
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

}