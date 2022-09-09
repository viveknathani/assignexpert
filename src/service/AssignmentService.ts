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
            const classEntry = await database.getClass(assignmentDetails.assignment.classId);
            if(classEntry.facultyId != facultyId){
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
            const assignmentDetails = await database.getAssignmentDetails(id);
            if(assignmentDetails === undefined || assignmentDetails.assignment.id === ''|| assignmentDetails.assignment.id === undefined) {
                throw new errors.ErrAssignmentNotFound;
            }
            const classEntry = await database.getClass(assignmentDetails.assignment.classId);
            if(classEntry.facultyId != facultyId) {
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
            let assignmentSummaries: entity.AssignmentSummary[] = [];
            if(!isStudent) {
                const classEntry = await database.getClass(classId);
                if(classEntry.facultyId!=entityId){
                    throw new errors.ErrInvalidFacultyOperation;
                }
                assignmentSummaries = await database.getAssignmentSummariesForClass(classId);
            } else {
                const isMember = await database.isMember(classId,entityId);
                if(!isMember){
                    throw new errors.ErrInvalidStudentOperation;
                }
                assignmentSummaries = await database.getAssignmentSummariesForClass(classId);
                for(let i = 0; i < assignmentSummaries.length; i++) {
                    const submission: entity.Submission = await database.getMarkedCompleteSubmissionForAssignmentForStudent(assignmentSummaries[i].id,entityId);
                    if(submission === undefined || submission.id === undefined || submission.id === '') {
                        assignmentSummaries[i].hasCompleted = false;
                    } else {
                        assignmentSummaries[i].hasCompleted = true;
                    }
                }
            }
            return assignmentSummaries;
        } catch (err) {
            throw err;
        }
    }

    public async getAssignment(assignmentId: string, isStudent: boolean, entityId: string): Promise<entity.AssignmentDetails> {
        try {
            let assignmentdetails: entity.AssignmentDetails =  await database.getAssignmentDetails(assignmentId);
            if(assignmentdetails === undefined || assignmentdetails.assignment.id === undefined || assignmentdetails.assignment.id ===''){
                throw new errors.ErrAssignmentNotFound;
            }
            if(!isStudent) {
                const classEntry = await database.getClass(assignmentdetails.assignment.classId);
                if(classEntry.facultyId!=entityId){
                    throw new errors.ErrInvalidFacultyOperation;
                }
                return assignmentdetails;
            } else {
                const isMember = await database.isMember(assignmentdetails.assignment.classId,entityId);
                if(!isMember){
                    throw new errors.ErrInvalidStudentOperation;
                }
                const assignmentDetails: entity.AssignmentDetails = {
                    assignment: assignmentdetails.assignment,
                    templates: assignmentdetails.templates,
                }
                return assignmentdetails;
            }
        } catch (err) {
            throw err;
        }
    }

    public async makeSubmission(submission: entity.Submission): Promise<string> {
        const codeExecutionService: CodeExecutionService = CodeExecutionService.getInstance();
        const assignmentDetails: entity.AssignmentDetails = await database.getAssignmentDetails(submission.assignmentId);
        const completeSubmission = await database.getMarkedCompleteSubmissionForAssignmentForStudent(submission.assignmentId,submission.studentId);
        if(completeSubmission === undefined || completeSubmission.id === ''|| completeSubmission.id === undefined){
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
        if(submission.lang===entity.Language['c']){
            codeExecutionInput.language = "c";
            if(assignmentDetails.templates){
                for(let i =0; i<assignmentDetails.templates.length; i++){
                    if(assignmentDetails.templates[i].lang===entity.Language['c']){
                        codeExecutionInput.code = assignmentDetails.templates[i].preSnippet + submission.code + assignmentDetails.templates[i].postSnippet;
                    }
                }
            }
            if(codeExecutionInput.code===''){
                codeExecutionInput.code = submission.code;
            }
        } else if(submission.lang===entity.Language['cpp']){
            codeExecutionInput.language = "cpp";
            if(assignmentDetails.templates){
                for(let i =0; i<assignmentDetails.templates.length; i++){
                    if(assignmentDetails.templates[i].lang===entity.Language['cpp']){
                        codeExecutionInput.code = assignmentDetails.templates[i].preSnippet + submission.code + assignmentDetails.templates[i].postSnippet;
                    }
                }
            }
            if(codeExecutionInput.code===''){
                codeExecutionInput.code = submission.code;
            }
        }else if(submission.lang===entity.Language['python']){
            codeExecutionInput.language = "python";
            if(assignmentDetails.templates){
                for(let i =0; i<assignmentDetails.templates.length; i++){
                    if(assignmentDetails.templates[i].lang===entity.Language['python']){
                        codeExecutionInput.code = assignmentDetails.templates[i].preSnippet + submission.code + assignmentDetails.templates[i].postSnippet;
                    }
                }
            }
            if(codeExecutionInput.code===''){
                codeExecutionInput.code = submission.code;
            }
        }else if(submission.lang===entity.Language['java']){
            codeExecutionInput.language = "java";
            if(assignmentDetails.templates){
                for(let i =0; i<assignmentDetails.templates.length; i++){
                    if(assignmentDetails.templates[i].lang===entity.Language['java']){
                        codeExecutionInput.code = assignmentDetails.templates[i].preSnippet + submission.code + assignmentDetails.templates[i].postSnippet;
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
        if(assignmentDetails.testCases){
            for(let i = 0; i<assignmentDetails.testCases.length;i++){
                codeExecutionInput.testCases[i] = assignmentDetails.testCases[i];
            }
        }

        const jobId = codeExecutionService.runCode(codeExecutionInput); 
        submission.id = jobId.substring(4);
        const id = await database.insertSubmission(submission);
        return id;
    }

    public async markSubmissionAsComplete(studentId: string, submissionId: string){
        try{
            const submission = await database.getSubmission(submissionId);
            if(submission.studentId != studentId || submission.id==='' || submission.id===undefined || submission === undefined){
                throw new errors.ErrInvalidStudentOperation;
            }
            await database.updateSubmission(submissionId);
        } catch (err) {
            throw err;
        }
    }
    
    public async getSubmission(studentId: string, submissionId: string): Promise<entity.Submission>{
        try{
            let submission = await database.getSubmission(submissionId);
            if(submission.studentId!=studentId) {
                throw new errors.ErrInvalidStudentOperation;
            }
            const assignmentDetails = await database.getAssignmentDetails(submission.assignmentId);

            //update the result in the database
            if(submission.resultMessage === '' || submission.resultMessage === undefined){
                const codeExecutionService: CodeExecutionService = CodeExecutionService.getInstance();
                const data = await codeExecutionService.getJobResult(`job-${submissionId}`);
                if(data === undefined){
                    throw new errors.ErrSubmissionNotFound;
                }
                submission.memoryUsedInKiloBytes = data.memoryUsed;
                submission.timeTaken = data.timeTaken;
                submission.resultStatus = data.resultStatus;
                submission.resultMessage = data.resultMessage;
                if(data.resultStatus===entity.ResultStatus.AC){
                    submission.points = assignmentDetails.assignment.points;
                } else {
                    submission.points = 0;
                }
                await database.updateSubmissionResult(submission.id,data,submission.points);                
            }
            
            //display resultStatus as Not Available for assignments where holdPoints is true
            if(submission.resultStatus===entity.ResultStatus.AC || submission.resultStatus===entity.ResultStatus.PR || submission.resultStatus===entity.ResultStatus.WA){
                if(assignmentDetails.assignment.holdPoints){
                    submission.resultStatus = entity.ResultStatus['NA'];
                    submission.resultMessage = '';
                    submission.points = 0;
                }
            }
            return submission;
        } catch (err) {
            throw err;
        }
    }

    public async getAllSubmissionsForAssignment(assignmentId: string, entityId: string, isStudent: boolean): Promise<entity.SubmissionSummary[]> {
        try{
            if(isStudent) {
                let submissionSummaries = await database.getSubmissionSummariesForStudent(assignmentId,entityId);
                const assignmentDetails = await database.getAssignmentDetails(assignmentId);
                if(assignmentDetails.assignment.holdPoints){
                    for(let i = 0; i<submissionSummaries.length; i++){
                        if(submissionSummaries[i].resultStatus===entity.ResultStatus.AC || submissionSummaries[i].resultStatus===entity.ResultStatus.PR || submissionSummaries[i].resultStatus===entity.ResultStatus.WA){
                                submissionSummaries[i].resultStatus = entity.ResultStatus['NA'];
                                submissionSummaries[i].points = 0;
                        }  
                    }
                }
                return submissionSummaries;
            } else {
                const assignmentDetails = await database.getAssignmentDetails(assignmentId);
                const classEntry = await database.getClass(assignmentDetails.assignment.classId);
                if(classEntry.facultyId!=entityId) {
                    throw new errors.ErrInvalidFacultyOperation;
                }
                const submissionSummaries = await database.getSubmissionSummaries(assignmentId);
                return submissionSummaries;
            }
        } catch (err) {
            throw err;
        }
    }
}