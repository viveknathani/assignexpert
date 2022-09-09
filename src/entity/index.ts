export interface User {

    id: string,
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    uiTheme: string,
    editorTheme: string,
    wantsEmailNotifications: boolean
}

export interface Student {
    id: string,
    userId: string,
    rollNumber: number   
}

export interface Faculty {
    id: string,
    userId: string,
    employeeNumber: number
}

export interface SessionInfo {
    
    userId: string,
    isStudent: boolean,
    facultyId?: string,
    studentId?: string
}

export interface Preferences {

    uiTheme?: string,
    editorTheme?: string,
    wantsEmailNotifications?: boolean
}

export interface TestCase {

    input: string,
    output: string
}

export interface CodeExecutionInput {

    executionType: 'judge' | 'run';
    code: string,
    language: string,
    inputForRun: string,
    testCases: TestCase[],
    timeLimit: number,
    memoryLimit: number
}

export interface CodeExecutionOutput {

    resultStatus: ResultStatus,
    resultMessage: string,
    timeTaken: number,
    memoryUsed: number
}

export enum CodeExecutionProgress {
    START,
    MKDIR,
    DOCKER_CREATE,
    DOCKER_START,
    COMPUTE_RESULT,
    CLEAN
}

export enum ResultStatus {
    AC = "AC",
    WA = "WA",
    TLE = "TLE",
    MLE = "MLE",
    CE = "CE",
    RE = "RE",
    PR = "PR",
    NA = "NA"
}

export interface Class {
    id: string,
    facultyId: string,
    name: string,
    code: string    
}

export interface Member {
    id: string,
    classId: string,
    studentId: string
}

export enum Language {
    c = 'c',
    cpp = 'cpp',
    python = 'python',
    java = 'java'
}

export enum DifficultyLevel {
    EASY = 'EASY',
    MEDIUM = 'MEDIUM',
    DIFFICULT = 'DIFFICULT'
}

export interface Assignment {
    id: string,
    classId: string,
    title: string,
    description: string,
    sampleInput: string,
    sampleOutput: string,
    constraints: string,
    points: number,
    hasTemplate: boolean,
    acceptedLanguages: Language[],
    holdPoints: boolean,
    deadline: Date,
    difficultyLevel: DifficultyLevel,    
}

export interface Template {
    id: string,
    assignmentId: string,
    lang: Language,
    snippet: string,
    preSnippet: string,
    postSnippet: string
}

export interface AssignmentTestCase {
    id: string,
    assignmentId: string,
    points: number,
    input: string,
    output: string
}

export interface AssignmentDetails {
    assignment: Assignment,
    templates?: Template[],
    testCases?: AssignmentTestCase[]     
}

export interface AssignmentSummary {
    id: string,
    title: string,
    difficultyLevel: string,
    hasCompleted?: boolean
}

export interface Submission {
    id: string,
    assignmentId: string,
    studentId: string,
    code: string,
    lang: Language,
    resultStatus: ResultStatus,
    resultMessage: string,
    timeTaken: number,
    memoryUsedInKiloBytes: number,
    points: number,
    submittedAt: Date,
    markCompleted: boolean
}

export interface SubmissionSummary {
    studentRollNumber: string,
    resultStatus: ResultStatus,
    points: number,
    timeTaken: number,
    memoryUsed: number,
    submittedAt: Date
}

export interface UpdateUser {
    firstName?: string,
    lastName?: string,
    oldPassword?: string,
    newPassword?: string,
    preferences?: Preferences
}

export interface Email {
    to: string[],
    subject: string,
    content: string
}
