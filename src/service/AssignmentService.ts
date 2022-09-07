import * as entity from '../entity';
import * as database from '../database';
import * as errors from './errors';
import { CodeExecutionService } from './CodeExecutionService';

export class AssignmentService {
    private static instance: AssignmentService;
    private constructor() {}

    //follows singleton pattern
    public static getInstance(): AssignmentService {

        if (!AssignmentService.instance) {
            AssignmentService.instance = new AssignmentService();
        }

        return AssignmentService.instance;
    }

    public async insertAssignment(assignmentDetails: entity.AssignmentDetails, isStudent: boolean, facultyId: string): Promise<string> {
        try{
            if(isStudent) {
                throw new errors.ErrInvalidStudentOperation;
            }
            const c = await database.getClass(assignmentDetails.assignment.classId);
            if(c.facultyId != facultyId){
                throw new errors.ErrInvalidFacultyOperation;
            }
            const id = await database.insertAssignment(assignmentDetails);
            return id;
        } catch (err) {
            throw err;
        }
    }

    public async deleteAssignment(id: string, facultyId: string, isStudent: boolean) {
        try{
            if(isStudent) {
                throw new errors.ErrInvalidStudentOperation;
            }
            const a = await database.getAssignmentDetails(id);
            if(a === undefined || a.assignment.id === ''|| a.assignment.id === undefined) {
                throw new errors.ErrAssignmentNotFound;
            }
            const c = await database.getClass(a.assignment.classId);
            if(c.facultyId != facultyId) {
                throw new errors.ErrInvalidFacultyOperation;
            }
            await database.deleteAssignment(id);
        } catch (err) {
            throw err;
        }
    }

    public async updateAssignment() {
        try{

        } catch (err) {
            throw err;
        }
    }
    
    public async getAllAssignments(classId: string, isStudent: boolean, entityId: string): Promise<entity.AssignmentSummary[]> {
        try {
            let a: entity.AssignmentSummary[] = [];
            if(!isStudent) {
                const c = await database.getClass(classId);
                if(c.facultyId!=entityId){
                    throw new errors.ErrInvalidFacultyOperation;
                }
                a = await database.getAssignmentSummariesForClass(classId);
            } else {
                const isMember = await database.isMember(classId,entityId);
                if(!isMember){
                    throw new errors.ErrInvalidStudentOperation;
                }
                a = await database.getAssignmentSummariesForClass(classId);
                for(let i = 0; i < a.length; i++) {
                    const s: entity.Submission = await database.getMarkedCompleteSubmissionForAssignmentForStudent(a[i].id,entityId);
                    if(s === undefined || s.id === undefined || s.id === '') {
                        a[i].hasCompleted = false;
                    } else {
                        a[i].hasCompleted = true;
                    }
                }
            }
            return a;
        } catch (err) {
            throw err;
        }
    }

    public async getAssignment(assignmentId: string, isStudent: boolean, entityId: string): Promise<entity.AssignmentDetails> {
        try {
            let a: entity.AssignmentDetails = await database.getAssignmentDetails(assignmentId);
            if(a === undefined || a.assignment.id === undefined || a.assignment.id ===''){
                throw new errors.ErrAssignmentNotFound;
            }
            if(!isStudent) {
                const c = await database.getClass(a.assignment.classId);
                if(c.facultyId!=entityId){
                    throw new errors.ErrInvalidFacultyOperation;
                }
                return a;
            } else {
                const isMember = await database.isMember(a.assignment.classId,entityId);
                if(!isMember){
                    throw new errors.ErrInvalidStudentOperation;
                }
                const assignmentDetails: entity.AssignmentDetails = {
                    assignment: a.assignment,
                    templates: a.templates,
                }
                return assignmentDetails;
            }
        } catch (err) {
            throw err;
        }
    }

    public async makeSubmission(submission: entity.Submission): Promise<string> {
        const codeExecutionService: CodeExecutionService = CodeExecutionService.getInstance();
        const a: entity.AssignmentDetails = await database.getAssignmentDetails(submission.assignmentId);
        const s = await database.getMarkedCompleteSubmissionForAssignmentForStudent(submission.assignmentId,submission.studentId);
        if(s === undefined || s.id === ''|| s.id === undefined){
            throw new errors.ErrAssignmentAlreadyCompleted;
        }
        
        let codeExecutionInput: entity.CodeExecutionInput = {
            executionType: 'judge',
            code: '',
            language: '',
            inputForRun: '',
            testCases: [],
            timeLimit: 10,
            memoryLimit: 1000,
        };

        //get code snippet to be run depending on the language
        if(submission.lang===entity.language['c']){
            codeExecutionInput.language = "c";
            if(a.templates){
                for(let i =0; i<a.templates.length; i++){
                    if(a.templates[i].lang===entity.language['c']){
                        codeExecutionInput.code = a.templates[i].preSnippet + submission.code + a.templates[i].postSnippet;
                    }
                }
            }
            if(codeExecutionInput.code===''){
                codeExecutionInput.code = submission.code;
            }
        } else if(submission.lang===entity.language['cpp']){
            codeExecutionInput.language = "cpp";
            if(a.templates){
                for(let i =0; i<a.templates.length; i++){
                    if(a.templates[i].lang===entity.language['cpp']){
                        codeExecutionInput.code = a.templates[i].preSnippet + submission.code + a.templates[i].postSnippet;
                    }
                }
            }
            if(codeExecutionInput.code===''){
                codeExecutionInput.code = submission.code;
            }
        }else if(submission.lang===entity.language['python']){
            codeExecutionInput.language = "python";
            if(a.templates){
                for(let i =0; i<a.templates.length; i++){
                    if(a.templates[i].lang===entity.language['python']){
                        codeExecutionInput.code = a.templates[i].preSnippet + submission.code + a.templates[i].postSnippet;
                    }
                }
            }
            if(codeExecutionInput.code===''){
                codeExecutionInput.code = submission.code;
            }
        }else if(submission.lang===entity.language['java']){
            codeExecutionInput.language = "java";
            if(a.templates){
                for(let i =0; i<a.templates.length; i++){
                    if(a.templates[i].lang===entity.language['java']){
                        codeExecutionInput.code = a.templates[i].preSnippet + submission.code + a.templates[i].postSnippet;
                    }
                }
            }
            if(codeExecutionInput.code===''){
                codeExecutionInput.code = submission.code;
            }
        } else {
            codeExecutionInput.code = submission.code;
            codeExecutionInput.language = "other";
        }

        //get testcases in the form of entity TestCase as required by the code execution service
        if(a.testCases){
            for(let i = 0; i<a.testCases.length;i++){
                codeExecutionInput.testCases[i] = a.testCases[i];
            }
        }

        const jobId = codeExecutionService.runCode(codeExecutionInput); 
        submission.id = jobId.substring(4);
        const id = await database.insertSubmission(submission);
        return id;
    }

    public async markSubmissionAsComplete(studentId: string, submissionId: string){
        try{
            const s = await database.getSubmission(submissionId);
            if(s.studentId != studentId || s.id==='' || s.id===undefined || s === undefined){
                throw new errors.ErrInvalidStudentOperation;
            }
            await database.updateSubmission(submissionId);
        } catch (err) {
            throw err;
        }
    }
    
    public async getSubmission(studentId: string, submissionId: string): Promise<entity.Submission>{
        try{
            let s = await database.getSubmission(submissionId);
            if(s.studentId!=studentId) {
                throw new errors.ErrInvalidStudentOperation;
            }
            const a = await database.getAssignmentDetails(s.assignmentId);

            //update the result in the database
            if(s.resultMessage === '' || s.resultMessage === undefined){
                const codeExecutionService: CodeExecutionService = CodeExecutionService.getInstance();
                const data = await codeExecutionService.getJobResult(`job-${submissionId}`);
                if(data === undefined){
                    throw new errors.ErrSubmissionNotFound;
                }
                s.memoryUsedInKiloBytes = data.memoryUsed;
                s.timeTaken = data.timeTaken;
                s.resultStatus = data.resultStatus;
                s.resultMessage = data.resultMessage;
                if(data.resultStatus===entity.ResultStatus.AC){
                    s.points = a.assignment.points;
                } else {
                    s.points = 0;
                }
                await database.updateSubmissionResult(s.id,data,s.points);                
            }
            
            //display resultStatus as Not Available for assignments where holdPoints is true
            if(s.resultStatus===entity.ResultStatus.AC || s.resultStatus===entity.ResultStatus.PR || s.resultStatus===entity.ResultStatus.WA){
                if(a.assignment.holdPoints){
                    s.resultStatus = entity.ResultStatus['NA'];
                    s.resultMessage = '';
                    s.points = 0;
                }
            }
            return s;
        } catch (err) {
            throw err;
        }
    }

    public async getAllSubmissionsForAssignment(assignmentId: string, entityId: string, isStudent: boolean): Promise<entity.SubmissionSummary[]> {
        try{
            if(isStudent) {
                let ss = await database.getSubmissionSummariesForStudent(assignmentId,entityId);
                const a = await database.getAssignmentDetails(assignmentId);
                if(a.assignment.holdPoints){
                    for(let i = 0; i<ss.length; i++){
                        if(ss[i].resultStatus===entity.ResultStatus.AC || ss[i].resultStatus===entity.ResultStatus.PR || ss[i].resultStatus===entity.ResultStatus.WA){
                                ss[i].resultStatus = entity.ResultStatus['NA'];
                                ss[i].points = 0;
                        }  
                    }
                }
                return ss;
            } else {
                const a = await database.getAssignmentDetails(assignmentId);
                const c = await database.getClass(a.assignment.classId);
                if(c.facultyId!=entityId) {
                    throw new errors.ErrInvalidFacultyOperation;
                }
                const ss = await database.getSubmissionSummaries(assignmentId);
                return ss;
            }
        } catch (err) {
            throw err;
        }
    }
}