import * as entity from '../entity/';
import { v4 as uuidv4 } from 'uuid';
import { QueryResult } from 'pg';
import { execWithTransaction, queryWithTransaction } from '.';

const statementInsertAssignment = `insert into assignments (id, "classId", title,
    description, "sampleInput", "sampleOutput", constraints, points, 
    "hasTemplate", "acceptedLanguages", "holdPoints", deadline, "difficultyLevel", "timeLimitSeconds", "memoryLimitMB") 
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);`
const statementDeleteAssignment = "delete from assignments where id = $1;"
const statementSelectAssignment = `select * from assignments where id=$1;`
const statementSelectAssignmentSummariesForClass = `select id, title, "difficultyLevel" from assignments where assignments."classId" = $1;`
const statementUpdateAssignment = `update assignments set title = $2, description = $3, "sampleInput" = $4, "sampleOutput"= $5,
    constraints = $6, points = $7, "hasTemplate" = $8, "acceptedLanguages" = $9, "holdPoints" = $10, deadline = $11, "difficultyLevel" = $12 where id = $1;`
const statementInsertTemplate = `insert into templates (id, "assignmentId", lang, snippet, "preSnippet", "postSnippet") values ($1, $2, $3, $4, $5, $6);`
const statementUpdateTemplate = `update templates set snippet = $1, "preSnippet" = $2, "postSnippet" = $3 where id = $4;`
const statementSelectTemplates = `select * from templates where "assignmentId" = $1;`
const statementInsertTestCase = `insert into "testCases" (id, "assignmentId", points, input, output) values ($1, $2, $3, $4, $5);`
const statementUpdateTestCase = `update "testCases" set points = $1, input = $2, output = $3 where id = $4;`
const statementSelectTestCases = `select * from "testCases" where "assignmentId" = $1;`
const statementInsertSubmission = `insert into submissions (id, "assignmentId", 
    "studentId", code, lang, "resultStatus", "resultMessage", "timeTaken", "memoryUsedInKiloBytes", points,
    "submittedAt", "markCompleted") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`
const statementUpdateSubmission = `update submissions set "markCompleted" =  true where id = $1;`
const statementSelectSubmission = `select * from submissions where id = $1;`
const statementSelectSubmissionSummariesByAssignmentId = `select "rollNumber" as "studentRollNumber", "resultStatus", points, "timeTaken", "memoryUsedInKiloBytes", "submittedAt"
    from submissions, students where "assignmentId" = $1 and students.id = submissions."studentId";`
const statementSelectSubmissionSummariesByAssignmentIdForStudent = `select "rollNumber" as "studentRollNumber", "resultStatus", points, "timeTaken", "memoryUsedInKiloBytes", "submittedAt"
from submissions, students where "assignmentId" = $1 and students.id = submissions."studentId" and students.id = $2;`
const statementGetMarkedCompleteSubmissionForAssignmentForStudent = `select * from submissions where "assignmentId" = $1 and "studentId" = $2 and "markCompleted"=true;`
const statementUpdateSubmissionResult = `update submissions set "memoryUsedInKiloBytes" = $1, "timeTaken" = $2, "resultStatus" = $3, "resultMessage" = $4, points = $5 where id = $6;`


// take an assignment and insert it into the database.
// uuid will be created and assigned before inserting.
export async function insertAssignment(assignmentDetails: entity.AssignmentDetails) {

    assignmentDetails.assignment.id = uuidv4();
    await execWithTransaction(statementInsertAssignment, assignmentDetails.assignment.id, assignmentDetails.assignment.classId, assignmentDetails.assignment.title,
        assignmentDetails.assignment.description, assignmentDetails.assignment.sampleInput, assignmentDetails.assignment.sampleOutput, assignmentDetails.assignment.constraints,
        assignmentDetails.assignment.points, assignmentDetails.assignment.hasTemplate, assignmentDetails.assignment.acceptedLanguages, assignmentDetails.assignment.holdPoints, assignmentDetails.assignment.deadline, assignmentDetails.assignment.difficultyLevel,
        assignmentDetails.assignment.timeLimitSeconds, assignmentDetails.assignment.memoryLimitMB);
    if(assignmentDetails.templates) {
        for(let i = 0; i<assignmentDetails.templates.length; i++) {
            assignmentDetails.templates[i].id = uuidv4();
            assignmentDetails.templates[i].assignmentId = assignmentDetails.assignment.id;
            await execWithTransaction(statementInsertTemplate, assignmentDetails.templates[i].id,
                assignmentDetails.templates[i].assignmentId, assignmentDetails.templates[i].lang,
                assignmentDetails.templates[i].snippet, assignmentDetails.templates[i].preSnippet, assignmentDetails.templates[i].postSnippet);                
        }           
    }
    if(assignmentDetails.testCases) {
        for(let i = 0; i<assignmentDetails.testCases.length; i++) {
            assignmentDetails.testCases[i].id = uuidv4();
            assignmentDetails.testCases[i].assignmentId = assignmentDetails.assignment.id;
            await execWithTransaction(statementInsertTestCase, assignmentDetails.testCases[i].id, assignmentDetails.testCases[i].assignmentId,
                assignmentDetails.testCases[i].points, assignmentDetails.testCases[i].input, assignmentDetails.testCases[i].output);
        }
    }
    return assignmentDetails.assignment.id;
}


//update an assignment, it's templates and testcases
export async function updateAssignment(assignmentDetails: entity.AssignmentDetails) {
    await execWithTransaction(statementUpdateAssignment, assignmentDetails.assignment.id, assignmentDetails.assignment.title,
        assignmentDetails.assignment.description, assignmentDetails.assignment.sampleInput, assignmentDetails.assignment.sampleOutput, assignmentDetails.assignment.constraints,
        assignmentDetails.assignment.points, assignmentDetails.assignment.hasTemplate, assignmentDetails.assignment.acceptedLanguages, assignmentDetails.assignment.holdPoints, assignmentDetails.assignment.deadline, assignmentDetails.assignment.difficultyLevel);
    if(assignmentDetails.templates) {
        for(let i = 0; i<assignmentDetails.templates.length; i++) {
            await execWithTransaction(statementUpdateTemplate, assignmentDetails.templates[i].snippet, assignmentDetails.templates[i].preSnippet, assignmentDetails.templates[i].postSnippet,
                assignmentDetails.templates[i].id);
        }
    }
    if(assignmentDetails.testCases) {
        for(let i = 0; i<assignmentDetails.testCases.length; i++) {
            await execWithTransaction(statementUpdateTestCase, assignmentDetails.testCases[i].points, assignmentDetails.testCases[i].input, assignmentDetails.testCases[i].output,
                assignmentDetails.testCases[i].id);
        }
    }
        
}

// delete a assignment based on id.
export async function deleteAssignment(id: string) {

    await execWithTransaction(statementDeleteAssignment, id);
}

//get assignment, templates and testcases from an id
export async function getAssignmentDetails(id: string): Promise<entity.AssignmentDetails> {
    let assignment: entity.Assignment = {
        id: '', classId: '', title: '', description: '', sampleInput: '', sampleOutput: '',
        constraints: '', points: 0, hasTemplate: false, acceptedLanguages: [],holdPoints: true, 
        deadline: new Date(), difficultyLevel: entity.DifficultyLevel.EASY,
        timeLimitSeconds: 0, memoryLimitMB: 0
    };
    await queryWithTransaction(statementSelectAssignment, function scanRows(result: QueryResult<any>): Error | undefined {        
        assignment = result.rows[0];
        return undefined;             
    }, id);

    const testCases: entity.AssignmentTestCase[] = [];
    await queryWithTransaction(statementSelectTestCases, function scanRows(result: QueryResult<any>):Error |undefined {
        for (let i = 0; i<result.rows.length; i++) {
            testCases.push(result.rows[i]);
        }
        return undefined;
    },assignment.id);
    
    const templates: entity.Template[] = [];
    if(assignment.hasTemplate) {
        await queryWithTransaction(statementSelectTemplates, function scanRows(result: QueryResult<any>):Error |undefined {
            for (let i = 0; i<result.rows.length; i++) {
                templates.push(result.rows[i]);
            }
            return undefined;
        },assignment.id);
    }
    const assignmentDetails: entity.AssignmentDetails = {
        assignment: assignment, templates: templates, testCases: testCases
    }
    return assignmentDetails;
}

//get all assignment summaries from a class
export async function getAssignmentSummariesForClass( id: string): Promise <entity.AssignmentSummary[]> {
    const assignmentSummaries : entity.AssignmentSummary[] = [];
    await queryWithTransaction(statementSelectAssignmentSummariesForClass, function scanRows(result: QueryResult<any>):Error |undefined {
        for (let i = 0; i<result.rows.length; i++) {
            assignmentSummaries.push(result.rows[i]);
        }
        return undefined;
    },id);
    return assignmentSummaries;
}

// take a submission and insert it into the database.
// uuid will be created and assigned before inserting.
export async function insertSubmission(submission: entity.Submission): Promise<string> {
    
    submission.id = uuidv4();
    await execWithTransaction(statementInsertSubmission, submission.id, submission.assignmentId, submission.studentId,
        submission.code, submission.lang, submission.resultStatus, submission.resultMessage, submission.timeTaken, submission.memoryUsedInKiloBytes,
        submission.points, submission.submittedAt, submission.markCompleted);
    return submission.id;
}

//update markCompleted in submissions to true using id
export async function updateSubmission(id: string) {
    await execWithTransaction(statementUpdateSubmission, id);
}

//get a submission using id
export async function getSubmission(id: string): Promise<entity.Submission> {

    let submission: entity.Submission = {
        id: '', assignmentId: '', studentId: '', code: '', lang: entity.Language['c'], resultStatus: entity.ResultStatus['WA'], resultMessage: '',
        timeTaken: 0, memoryUsedInKiloBytes: 0, points: 0, submittedAt: new Date(), markCompleted: false
    };

    await queryWithTransaction(statementSelectSubmission, function scanRows(result: QueryResult<any>): Error | undefined {        

        submission = result.rows[0];
        return undefined;             
    }, id);

    return submission;
}

export async function getSubmissionSummaries(id: string): Promise <entity.SubmissionSummary[]> {
    const submissionSummaries: entity.SubmissionSummary[] = [];
    await queryWithTransaction(statementSelectSubmissionSummariesByAssignmentId, function scanRows(result: QueryResult<any>):Error |undefined {
        for (let i = 0; i<result.rows.length; i++) {
            submissionSummaries.push(result.rows[i]);
        }
        return undefined;
    },id);
    return submissionSummaries;        
}

export async function getSubmissionSummariesForStudent(assignmentId: string, studentId: string): Promise <entity.SubmissionSummary[]> {
    const submissionSummaries: entity.SubmissionSummary[] = [];
    await queryWithTransaction(statementSelectSubmissionSummariesByAssignmentIdForStudent, function scanRows(result: QueryResult<any>):Error |undefined {
        for (let i = 0; i<result.rows.length; i++) {
            submissionSummaries.push(result.rows[i]);
        }
        return undefined;
    }, assignmentId, studentId);
    return submissionSummaries;   
}

export async function getMarkedCompleteSubmissionForAssignmentForStudent(assignmentId: string, studentId: string): Promise<entity.Submission>{
    let submission: entity.Submission = {
        id: '', assignmentId: '', studentId: '', code: '', lang: entity.Language['c'], resultStatus: entity.ResultStatus['WA'], resultMessage: '',
        timeTaken: 0, memoryUsedInKiloBytes: 0, points: 0, submittedAt: new Date(), markCompleted: false
    };

    await queryWithTransaction(statementGetMarkedCompleteSubmissionForAssignmentForStudent, function scanRows(result: QueryResult<any>): Error | undefined {        

        submission = result.rows[0];
        return undefined;             
    }, assignmentId,studentId);

    return submission;    
}

export async function updateSubmissionResult(submissionId: string,data: entity.CodeExecutionOutput, points: number) {
    await execWithTransaction(statementUpdateSubmissionResult, data.memoryUsedKB, data.timeTakenMilliSeconds, data.resultStatus, data.resultMessage, points, submissionId);
}