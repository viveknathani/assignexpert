export interface User {

    id: string,
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    uiTheme: string,
    editorTheme: string,
    wantsEmailNotifications: boolean
};

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
