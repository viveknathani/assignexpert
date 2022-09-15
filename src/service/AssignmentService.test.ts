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
    email: 'naman.bansal.binny.test@gmail.com',
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
    email: 'aman.mit.binn.test@me.com',
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

test('insert/get assignment for faculty', async () => {
    await userService.signupFaculty(user2, faculty);
    await userService.signupStudent(user1, student);    
    const { sessionId } = await userService.login(user2.email, unhashedUser2Password);
    const { sessionIdStudent } = await userService.login(user1.email, unhashedUser1Password);
    const decoded = await userService.getSessionInfo(sessionId);
    if (decoded === undefined) {
        throw new Error('Could not get any data.');
    }
    const decodedStudent = await userService.getSessionInfo(sessionIdStudent);
    if (decodedStudent === undefined) {
        throw new Error('Could not get any data.');
    }
    class1.facultyId = faculty.id;
    const classId = await classService.insertClass(class1,decoded.isStudent);
    await classService.joinClass(user1.id, classId, true);
    assignmentDetails.assignment.classId = classId;
    const assignmentId = await assignmentService.insertAssignment(assignmentDetails, decoded.isStudent,class1.facultyId);

    const assignmentdetails = await assignmentService.getAssignment(assignmentId, decoded.isStudent, class1.facultyId);
    expect(assignmentdetails.assignment.classId).toEqual(class1.id);

    const assignmentSummaries =  await assignmentService.getAllAssignments(classId, decoded.isStudent, class1.facultyId);
    expect(assignmentSummaries[0].title).toEqual(assignmentDetails.assignment.title);

    await userService.logout(sessionId);
});
