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

    uiTheme: string,
    editorTheme: string,
    wantsEmailNotifications: boolean
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
    PR = "PR"
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

export interface UpdateUser {
    firstName?: string,
    lastName?: string,
    oldPassword?: string,
    newPassword?: string,
    preferences?: Preferences
}
