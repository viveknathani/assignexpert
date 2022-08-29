import dotenv from 'dotenv';
import * as cache from '../cache';
import { CodeExecutionService } from './CodeExecutionService';
import * as entity from '../entity';
dotenv.config();

cache.setupCache(process.env.REDIS_URL || '', 
                    process.env.REDIS_USER || '', process.env.REDIS_PWD || '');

const codeExecutionService: CodeExecutionService = CodeExecutionService.getInstance();

test('execute c', async () => {
    const code = `
        #include <stdio.h>
        int main() {
            int x, t;
            scanf("%d", &t);
            scanf("%d", &x);
            printf("%d\\n", x);
            return 0;
        }
    `;
    const language = 'c';
    const testCases: entity.TestCase[] = [
        {
            input: "5",
            output: "5"
        }
    ];
    const timeLimit = 1;
    const memoryLimit = 512;
    codeExecutionService.runCode({code, language, testCases, timeLimit, memoryLimit});
});