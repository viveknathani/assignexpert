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