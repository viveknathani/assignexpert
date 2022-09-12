import dotenv from 'dotenv';
import * as database from '../database';
import * as cache from '../cache';
import { UserService } from './UserService';
import { ClassService } from './ClassService';
import { AssignmentService } from './AssignmentService';
import * as entity from '../entity';
dotenv.config();

database.setupDatabase(process.env.DATABASE_URL || '');
cache.setupCache(process.env.REDIS_URL || '', 
                    process.env.REDIS_USER || '', process.env.REDIS_PWD || '');
afterAll(async () => await database.terminatePool());

const userService = UserService.getInstance();
const classService = ClassService.getInstance();
const assignmentService = AssignmentService.getInstance();

const user1: entity.User = {
    id: '1',
    firstName: 'Naman',
    lastName: 'Bansal',
    email: 'naman.bansal.binny@gmail.com',
    password: 'Namanpassword191@',
    uiTheme: 'light',
    editorTheme: 'light',
    wantsEmailNotifications: true
};
const unhashedUser1Password = user1.password;
const student: entity.Student = {
    id: '1',
    userId: user1.id,
    rollNumber: 19070122191
}

const user2: entity.User = {
    id: '2',
    firstName: 'Aman',
    lastName: 'Mittal',
    email: 'aman.mit.binny@me.com',
    password: 'Amanpassword191@',
    uiTheme: 'light',
    editorTheme: 'light',
    wantsEmailNotifications: true
};
const unhashedUser2Password = user2.password;
const faculty: entity.Faculty = {
    id: '1',
    userId: user2.id,
    employeeNumber: 19070122191
}

const class1: entity.Class = {
    id: '1',
    facultyId: faculty.id,
    name: 'Cloud Computing',
    code: ''
};

const assignment: entity.Assignment = {
    id: '',
    classId: class1.id,
    title: 'assignment 1',
    description: 'trial trial',
    sampleInput: '5',
    sampleOutput: '6',
    constraints: '',
    points: 10,
    hasTemplate: true,
    acceptedLanguages: [entity.Language.c,entity.Language.python],
    holdPoints: true,
    deadline: new Date(),
    difficultyLevel: entity.DifficultyLevel.EASY,
    timeLimitSeconds: 0,
    memoryLimitMB: 0
}

const template1: entity.Template = {
    id: '',
    assignmentId: assignment.id,
    lang: entity.Language.c,
    snippet: '',
    preSnippet: '',
    postSnippet: ''
}

const template2: entity.Template = {
    id: '',
    assignmentId: assignment.id,
    lang: entity.Language.python,
    snippet: '',
    preSnippet: '',
    postSnippet: ''
}

const templates: entity.Template[]= [];
templates.push(template1);
templates.push(template2);

const testcase1: entity.AssignmentTestCase = {
    id: '',
    assignmentId: assignment.id,
    points: 5,
    input: '5',
    output: '6'
}

const testcase2: entity.AssignmentTestCase = {
    id: '',
    assignmentId: assignment.id,
    points: 5,
    input: '10',
    output: '11'
}

const testCases: entity.AssignmentTestCase[] =[];
testCases.push(testcase1);
testCases.push(testcase2);

const assignmentDetails: entity.AssignmentDetails = {
    assignment: assignment,
    templates: templates,
    testCases: testCases
}

const submission: entity.Submission = {
    id: '',
    assignmentId: assignmentDetails.assignment.id,
    studentId: student.id,
    code: '',
    lang: entity.Language.c,
    resultStatus: entity.ResultStatus.NA,
    resultMessage: '',
    timeTaken: 0,
    memoryUsedInKiloBytes: 0,
    points: 0,
    submittedAt: new Date(),
    markCompleted: false
}

test('insert/get assignment for faculty', async () => {
    await userService.signupFaculty(user2, faculty);    
    const { sessionId } = await userService.login(user2.email, unhashedUser2Password);
    const decoded = await userService.getSessionInfo(sessionId);
    if (decoded === undefined) {
        throw new Error('Could not get any data.');
    }
    class1.facultyId = faculty.id;
    const classId = await classService.insertClass(class1,decoded.isStudent);
    assignmentDetails.assignment.classId = classId;
    let assignmentId = await assignmentService.insertAssignment(assignmentDetails, decoded.isStudent,class1.facultyId);

    const assignmentdetails = await assignmentService.getAssignment(assignmentId, decoded.isStudent, class1.facultyId);
    expect(assignmentdetails.assignment.classId).toEqual(class1.id);

    const assignmentSummaries =  await assignmentService.getAllAssignments(classId, decoded.isStudent, class1.facultyId);
    expect(assignmentSummaries[0].title).toEqual(assignmentDetails.assignment.title);

    await userService.logout(sessionId);
});

test('get assignment, insert/update/get submission for student', async () => {
    await userService.signupStudent(user1, student);
    const { sessionId } = await userService.login(user1.email, unhashedUser1Password);
    const decoded = await userService.getSessionInfo(sessionId);
    if (decoded === undefined) {
        throw new Error('Could not get any data.');
    }
    await classService.joinClass(user1.id, class1.code, decoded.isStudent); 

    if(decoded.studentId){
        const assignmentdetails: entity.AssignmentDetails = await assignmentService.getAssignment(assignmentDetails.assignment.id, decoded.isStudent, decoded.studentId);
        expect(assignmentdetails.assignment.title).toEqual(assignmentDetails.assignment.title);
        
        const assignmentSummaries: entity.AssignmentSummary[] = await assignmentService.getAllAssignments(class1.id, decoded.isStudent, decoded.studentId);
        expect(assignmentSummaries[0].title).toEqual(assignmentDetails.assignment.title);

        submission.assignmentId = assignmentdetails.assignment.id;
        submission.studentId = decoded.studentId;
        const submissionId = await assignmentService.makeSubmission(submission);

        const submissionEntry = await assignmentService.getSubmission(decoded.studentId,submissionId);
        expect(submissionEntry.assignmentId).toEqual(assignmentdetails.assignment.id);

        await assignmentService.markSubmissionAsComplete(decoded.studentId, submissionId);

        const submissionSummaries = await assignmentService.getAllSubmissionsForAssignment(assignmentdetails.assignment.id,decoded.studentId,decoded.isStudent);
        expect(submissionSummaries[0].studentRollNumber).toEqual(student.rollNumber);

        await userService.logout(sessionId);     
    }
});

test('get submissions, delete assignment for faculty', async () => {
    const { sessionId } = await userService.login(user2.email, unhashedUser2Password);
    const decoded = await userService.getSessionInfo(sessionId);
    if (decoded === undefined) {
        throw new Error('Could not get any data.');
    }
    const classes = await classService.getAllClasses(faculty.id, decoded.isStudent);
    if(classes){
        const assignments = await assignmentService.getAllAssignments(classes[0].id, decoded.isStudent,faculty.id);
        const submissions = await assignmentService.getAllSubmissionsForAssignment(assignments[0].id, faculty.id, decoded.isStudent);
        expect(submissions[0].studentRollNumber).toEqual(student.rollNumber);

        await assignmentService.deleteAssignment(assignments[0].id, faculty.id, decoded.isStudent);        
        await database.deleteClass(classes[0].id);
    }
    await userService.logout(sessionId);
    await userService.deleteUser(user1.id);
    await userService.deleteUser(user2.id);
});