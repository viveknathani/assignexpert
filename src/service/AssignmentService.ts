import * as entity from '../entity';
import * as database from '../database';
import * as errors from './errors';
import { CodeExecutionService, EmailService } from './index';
import {Workbook, Row, Cell} from 'exceljs';

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
            if(assignmentDetails.testCases) {
                let sum = 0;
                for(let i = 0; i < assignmentDetails.testCases.length; i++){
                    if(assignmentDetails.testCases[i].points<=0){
                        throw new errors.ErrNonPositivePointsForTestcase;
                    }
                    sum += assignmentDetails.testCases[i].points;
                }
                if(sum != assignmentDetails.assignment.points){
                    throw new errors.ErrTotalPointsNotEqualAssignmentPoints;
                }
            }
            const id = await database.insertAssignment(assignmentDetails);
            const emailService: EmailService = EmailService.getInstance();
            const students = await database.getStudentsWithEmail(assignmentDetails.assignment.classId);
            const emails = students.map(student => student.email)
            emailService.sendEmail({
                to: emails,
                subject: "New assignment",
                content: `You have a new assignment - ${assignmentDetails.assignment.title}`
            });
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

    private updateFromPartial<T>(obj: T, updates: Partial<T>): T {
        return {...obj, ...updates};
    }

    public async updateAssignment(partialAssignment: Partial<entity.Assignment>, partialTemplates: Partial<entity.Template>[], isStudent: boolean, facultyId: string) {
        try{
            if(isStudent) {
                throw new errors.ErrInvalidStudentOperation;
            }
            if (!partialAssignment.id) {
                throw errors.ErrAssignmentNotFound;
            }
            const assignmentDetails = await database.getAssignmentDetails(partialAssignment.id);
            if(assignmentDetails === undefined || assignmentDetails.assignment.id === ''|| assignmentDetails.assignment.id === undefined) {
                throw new errors.ErrAssignmentNotFound;
            }
            const classEntry = await database.getClass(assignmentDetails.assignment.classId);
            if(classEntry.facultyId != facultyId){
                throw new errors.ErrInvalidFacultyOperation;
            }
            const toUpdate = assignmentDetails;
            const assignment = this.updateFromPartial<entity.Assignment>(assignmentDetails.assignment, partialAssignment);
            let templates: entity.Template[] = [];
            let testCases: entity.AssignmentTestCase[] = [];
            let originalTemplates = new Map<string, entity.Template>();
            if (assignmentDetails.templates && partialTemplates.length !== 0) {
                for (const template of assignmentDetails.templates) {
                    originalTemplates.set(template.id, template);
                }
                for (const partialTemplate of partialTemplates) {
                    if (!partialTemplate.id) {
                        throw new errors.ErrTemplateNoId;
                    }
                    const originalTemplate = originalTemplates.get(partialTemplate.id);
                    if (originalTemplate) {
                        templates.push(this.updateFromPartial<entity.Template>(originalTemplate, partialTemplate));
                    }
                }
            }
            toUpdate.assignment = assignment;
            toUpdate.templates = templates;
            toUpdate.testCases = testCases;
            await database.updateAssignment(toUpdate);
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
            const assignmentDetails: entity.AssignmentDetails =  await database.getAssignmentDetails(assignmentId);
            if(assignmentDetails === undefined || assignmentDetails.assignment.id === undefined || assignmentDetails.assignment.id ===''){
                throw new errors.ErrAssignmentNotFound;
            }
            if(!isStudent) {
                const classEntry = await database.getClass(assignmentDetails.assignment.classId);
                if(classEntry.facultyId!=entityId){
                    throw new errors.ErrInvalidFacultyOperation;
                }
            } else {
                const isMember = await database.isMember(assignmentDetails.assignment.classId,entityId);
                if(!isMember){
                    throw new errors.ErrInvalidStudentOperation;
                }
                assignmentDetails.testCases = [];
            }
            return assignmentDetails;
        } catch (err) {
            throw err;
        }
    }

    public async makeSubmission(submission: entity.Submission): Promise<string> {

        const codeExecutionService: CodeExecutionService = CodeExecutionService.getInstance();
        const assignmentDetails: entity.AssignmentDetails = await database.getAssignmentDetails(submission.assignmentId);
        const completeSubmission = await database.getMarkedCompleteSubmissionForAssignmentForStudent(submission.assignmentId,submission.studentId);
        if(completeSubmission !== undefined && completeSubmission.id !== ''){
            throw new errors.ErrAssignmentAlreadyCompleted;
        }
        if(submission.submittedAt > assignmentDetails.assignment.deadline) {
            throw new errors.ErrLateSubmissionNotAllowed;
        }
        const codeExecutionInput: entity.CodeExecutionInput = {
            executionType: 'judge',
            code: submission.code,
            language: submission.lang,
            inputForRun: '',
            testCases: assignmentDetails.testCases || [],
            timeLimitSeconds: assignmentDetails.assignment.timeLimitSeconds,
            memoryLimitMB: assignmentDetails.assignment.memoryLimitMB,
        };

        if (assignmentDetails.assignment.hasTemplate && assignmentDetails.templates) {
            assignmentDetails.templates.forEach((template) => {
                if (codeExecutionInput.language === template.lang) {
                    const pre = template.preSnippet;
                    const post = template.postSnippet;
                    const code = submission.code;
                    codeExecutionInput.code = `${pre}${code}${post}`;
                }
            });
        }

        const submissionId = await database.insertSubmission(submission);
        const jobId = `job-${submissionId}`;
        codeExecutionInput.customJobId = jobId;
        codeExecutionService.runCode(codeExecutionInput);
        return submissionId;
    }

    public async markSubmissionAsComplete(studentId: string, submissionId: string){
        try{
            const submission = await database.getSubmission(submissionId);
            if(submission.studentId != studentId || submission.id==='' || submission.id===undefined || submission === undefined){
                throw new errors.ErrInvalidStudentOperation;
            }
            const assignmentDetails: entity.AssignmentDetails = await database.getAssignmentDetails(submission.assignmentId);
            const completeSubmission = await database.getMarkedCompleteSubmissionForAssignmentForStudent(submission.assignmentId,submission.studentId);
            if(completeSubmission !== undefined && completeSubmission.id !== ''){
                throw new errors.ErrAssignmentAlreadyCompleted;
            }
            if(submission.submittedAt > assignmentDetails.assignment.deadline) {
                throw new errors.ErrLateSubmissionNotAllowed;
            }
            await database.updateSubmission(submissionId);
        } catch (err) {
            throw err;
        }
    }
    
    public async getSubmission(submissionId: string): Promise<entity.Submission>{
        try{
            const submission = await database.getSubmission(submissionId);
            const assignmentDetails = await database.getAssignmentDetails(submission.assignmentId);

            //update the result in the database
            if(submission.resultMessage === '' || submission.resultMessage === undefined){
                const codeExecutionService: CodeExecutionService = CodeExecutionService.getInstance();
                const data = await codeExecutionService.getJobResult(`job-${submissionId}`);
                if(data === undefined){
                    throw new errors.ErrSubmissionNotFound;
                }
                submission.points=0;
                for (let i = 0; i < data.length; i++) {
                    submission.resultStatus = data[i].resultStatus;
                    submission.resultMessage = data[i].resultMessage;
                    submission.timeTaken = Math.max(submission.timeTaken, data[i].timeTakenMilliSeconds);
                    submission.memoryUsedInKiloBytes = Math.max(submission.memoryUsedInKiloBytes, data[i].memoryUsedKB);
                    if (data[i].resultStatus !== entity.ResultStatus.AC) {
                        break;
                    }
                    if(assignmentDetails.testCases){
                        submission.points += assignmentDetails.testCases[i].points;
                    }
                }
                await database.updateSubmissionResult(submission.id, {
                    timeTakenMilliSeconds: submission.timeTaken,
                    memoryUsedKB: submission.memoryUsedInKiloBytes,
                    resultStatus: submission.resultStatus,
                    resultMessage: submission.resultMessage
                },submission.points);                
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
                const submissionSummaries = await database.getSubmissionSummariesForStudent(assignmentId,entityId);
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

    public async getResult(assignmentId: string, entityId: string, isStudent: boolean): Promise<string>{
        try{
            if(isStudent){
                throw new errors.ErrInvalidStudentOperation;
            } else {
                const assignmentDetails = await database.getAssignmentDetails(assignmentId);
                const classEntry = await database.getClass(assignmentDetails.assignment.classId);
                if(classEntry.facultyId!=entityId) {
                    throw new errors.ErrInvalidFacultyOperation;
                }
                const members = await database.getStudentsForClass(classEntry.id);
                const finalSubmissionSummariesForAllStudents : entity.SubmissionSummary[] = [];
                for( let i = 0; i < members.length; i++) {
                    finalSubmissionSummariesForAllStudents[i].studentRollNumber = members[i].rollNumber;
                    const submission: entity.Submission = await database.getMarkedCompleteSubmissionForAssignmentForStudent(assignmentId,members[i].id);
                    finalSubmissionSummariesForAllStudents[i].memoryUsed = submission.memoryUsedInKiloBytes || 0;
                    finalSubmissionSummariesForAllStudents[i].timeTaken = submission.timeTaken || 0;
                    finalSubmissionSummariesForAllStudents[i].resultStatus = submission.resultStatus || entity.ResultStatus.NA;
                    finalSubmissionSummariesForAllStudents[i].points = submission.points || 0;
                    finalSubmissionSummariesForAllStudents[i].submittedAt = submission.submittedAt || new Date();
                }
                const fileName = `../temp/${assignmentDetails.assignment.title}${Date.now()}`
                const workbook = new Workbook();
                const worksheet = workbook.addWorksheet(assignmentDetails.assignment.title);
                const headers = [
                    { header: 'RollNumber', key: 'rollNumber', width: 15 },
                    { header: 'ResultStatus', key: 'resultStatus', width: 15 },
                    { header: 'Points', key: 'point', width: 15 },
                    { header: 'TimeTaken', key: 'timeTaken', width: 15 },
                    { header: 'MemoryUsed', key: 'memoryUSed', width: 15 },
                    { header: 'SubmittedAt', key: 'submittedAt', width: 15 },
                ]
                worksheet.columns = headers;
                for(let i = 0; i<finalSubmissionSummariesForAllStudents.length; i++){
                    worksheet.addRow(finalSubmissionSummariesForAllStudents[i]);
                }
                await workbook.xlsx.writeFile(fileName);
                return fileName;
            }
        } catch (err) {
            throw err;
        }
    }
}