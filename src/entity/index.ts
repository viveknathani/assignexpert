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

export interface JobQueueData {

    code: string,
    language: string,
    testCases: TestCase[]
}

export enum JobProgress {
    STARTED,
    MKDIR,
    DOCKER_BUILD,
    DOCKER_RUN,
    DOCKER_RMI,
    PROCESS_OUTPUTS,
    RM
}