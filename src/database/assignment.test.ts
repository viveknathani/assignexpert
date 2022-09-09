import dotenv from 'dotenv';
dotenv.config();

import { setupDatabase, terminatePool } from '.';
import * as entity from '../entity/';
import { insertClass, deleteClass, insertMember, deleteMember } from './class';
import { deleteUser, insertFaculty, insertStudent, insertUser } from './user';
import { insertAssignment, deleteAssignment, updateAssignment, getAssignmentDetails, getAssignmentSummariesForClass, insertSubmission, updateSubmission, getSubmission, getSubmissionSummaries, getSubmissionSummariesForStudent, } from './assignment';

setupDatabase(process.env.DATABASE_URL || '');
afterAll(async () => await terminatePool())


test('insert/get/update/delete assignment and submission', async () => {

    const user1: entity.User = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'jd@gmail.com',
        password: 'johnpassword',
        uiTheme: 'light',
        editorTheme: 'light',
        wantsEmailNotifications: true
    }
    await insertUser(user1);
    const faculty1: entity.Faculty = {
        id: '1',
        userId: user1.id,
        employeeNumber: 19070122191
    }
    await insertFaculty(faculty1);

    const class1: entity.Class = {
        id: '1',
        facultyId: faculty1.id,
        name: 'Cloud Computing',
        code: 'ff0011'
    }
    await insertClass(class1);

    const user2: entity.User = {
        id: '2',
        firstName: 'Alice',
        lastName: 'Wonderland',
        email: 'aw@gmail.com',
        password: 'alicepassword',
        uiTheme: 'light',
        editorTheme: 'light',
        wantsEmailNotifications: true
    }
    await insertUser(user2);

    const student1: entity.Student = {
        id: '1',
        userId: user2.id,
        rollNumber: 19070122191
    }
    await insertStudent(student1);

    await insertMember({
        id: '1',
        studentId: student1.id,
        classId: class1.id
    });

    let assignment: entity.Assignment = {
        id: '1',
        classId: class1.id,
        title: 'assignment 1',
        description: '',
        sampleInput: '',
        sampleOutput: '',
        constraints: '',
        points: 10,
        hasTemplate: true,
        acceptedLanguages: [entity.Language['cpp']],
        holdPoints: true,
        deadline: new Date(),
        difficultyLevel: entity.DifficultyLevel['EASY']
    }
    const template: entity.Template = {
        id: '1',
        assignmentId: assignment.id,
        lang: entity.Language['python'],
        snippet: 'b',
        preSnippet: 'a',
        postSnippet: 'c'
    }
    const templates: entity.Template[] = [];
    templates.push(template);
    const testcase: entity.AssignmentTestCase = {
        id: '1',
        assignmentId: assignment.id,
        points: 10,
        input: 'a',
        output: 'a'
    }
    const testCases: entity.AssignmentTestCase[] = [];
    testCases.push(testcase);
    let assignmentDetails: entity.AssignmentDetails = {
        assignment: assignment,
        templates: templates,
        testCases: testCases
    };
    const assignmentId = await insertAssignment(assignmentDetails);

    assignmentDetails.assignment.difficultyLevel = entity.DifficultyLevel['MEDIUM'];
    await updateAssignment(assignmentDetails);

    const a: entity.AssignmentDetails = await getAssignmentDetails(assignmentDetails.assignment.id);
    expect(a.assignment.classId).toEqual(assignmentDetails.assignment.classId);
    if (a.templates && assignmentDetails.templates) {
        expect(a.templates[0].id).toEqual(assignmentDetails.templates[0].id)
    }
    if (a.testCases && assignmentDetails.testCases) {
        expect(a.testCases[0].id).toEqual(assignmentDetails.testCases[0].id)
    }

    const aSummaries: entity.AssignmentSummary[] = await getAssignmentSummariesForClass(class1.id);
    expect(aSummaries[0].id).toEqual(assignmentDetails.assignment.id);

    const submission: entity.Submission = {
        id: '1',
        assignmentId: assignmentId,
        studentId: student1.id,
        code: '',
        lang: entity.Language['python'],
        resultStatus: entity.ResultStatus['AC'],
        resultMessage: '',
        timeTaken: 100,
        memoryUsedInKiloBytes: 100,
        points: 8,
        submittedAt: new Date(),
        markCompleted: false
    }
    await insertSubmission(submission);
    await updateSubmission(submission.id);

    const s: entity.Submission = await getSubmission(submission.id);
    expect(s.assignmentId).toEqual(submission.assignmentId);

    const ss: entity.SubmissionSummary[] = await getSubmissionSummaries(assignmentDetails.assignment.id);
    expect(parseInt(ss[0].studentRollNumber)).toEqual(student1.rollNumber);

    const sss: entity.SubmissionSummary[] = await getSubmissionSummariesForStudent(assignmentDetails.assignment.id, student1.id);
    expect(parseInt(sss[0].studentRollNumber)).toEqual(student1.rollNumber);

    await deleteAssignment(assignmentDetails.assignment.id);
    await deleteMember(class1.id, student1.id);
    await deleteClass(class1.id);
    await deleteUser(user1.id);
    await deleteUser(user2.id);
});