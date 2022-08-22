import * as errors from './errors';
import * as entity from '../entity';

export class CodeExecutionService {

    private static instance: CodeExecutionService;
    private static supportedLanguages = new Set(["c", "cpp", "python", "java"]);
    private constructor() {}

     // follows the singleton pattern
     public static getInstance(): CodeExecutionService {

        if (!CodeExecutionService.instance) {
            CodeExecutionService.instance = new CodeExecutionService();
        }

        return CodeExecutionService.instance;
    }

    public static async runCode(code: string, language: string, testCases: entity.TestCase[]) {
        
        try {
            if (!this.supportedLanguages.has(language)) {
                throw new errors.ErrUnsupportedLanguage;
            }
        } catch (err) {
            throw err;
        }
    }
}