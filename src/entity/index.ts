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
    isStudent: boolean
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

export interface JobQueueData {}

export interface CodeExecutionInput extends JobQueueData {

    code: string,
    language: string,
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
