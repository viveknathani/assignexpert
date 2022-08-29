import * as entity from '../entity/';
import { v4 as uuidv4 } from 'uuid';
import { QueryResult } from 'pg';
import { execWithTransaction, queryWithTransaction } from '.';

const statementInsertUser = `insert into users (id, "firstName", "lastName", email, password, "uiTheme", "editorTheme", "wantsEmailNotifications") values ($1, $2, $3, $4, $5, $6, $7, $8);`
const statementSelectUserFromEmail = "select * from users where email = $1;"
const statementSelectStudentFromUserId = `select * from students where "userId" = $1;`;
const statementSelectFacultyFromUserId = `select * from faculties where "userId" = $1;`;
const statementDeleteUser = "delete from users where id = $1;"
const statementUpdateFirstName = `update users set "firstName" = $1 where id = $2;`;
const statementUpdateLastName = `update users set "lastName" = $1 where id = $2;`;
const statementUpdatePassword = `update users set password = $1 where id = $2;`;
const statementUpdatePreferences = `update users set "uiTheme" = $1, "editorTheme" = $2, "wantsEmailNotifications" = $3 where id = $4;`;
const statementInsertStudent = `insert into students (id, "userId", "rollNumber") values ($1, $2, $3);`;
const statementInsertFaculty = `insert into faculties (id, "userId", "employeeNumber") values ($1, $2, $3);`;

// take a user and insert it into the database.
// uuid will be created and assigned before inserting.
export async function insertUser(user: entity.User) {

    user.id = uuidv4();
    await execWithTransaction(statementInsertUser, user.id, user.firstName, user.lastName, user.email, user.password, user.uiTheme, user.editorTheme, user.wantsEmailNotifications);
}

// take a student and insert it into the database.
// uuid will be created and assigned before inserting.
export async function insertStudent(student: entity.Student) {

    student.id = uuidv4();
    await execWithTransaction(statementInsertStudent, student.id, student.userId, student.rollNumber);
}

// take a faculty and insert it into the database.
// uuid will be created and assigned before inserting.
export async function insertFaculty(faculty: entity.Faculty) {

    faculty.id = uuidv4();
    await execWithTransaction(statementInsertFaculty, faculty.id, faculty.userId,faculty.employeeNumber);
}


// get the first matching user from database based on email.
// if none exists, all fields are empty strings.
export async function getUser(email: string): Promise<entity.User> {

    let user: entity.User = {
        id: '', email: '', password: '', firstName: '', lastName: '', wantsEmailNotifications: true, uiTheme: '', editorTheme: ''
    };
    await queryWithTransaction(statementSelectUserFromEmail, 
        function scanRows(result: QueryResult<any>): Error | undefined {
            
            user = result.rows[0];
            return undefined;             
    }, email);

    return user as entity.User;
}

export async function getStudent(userId: string) {

    let student: entity.Student = {
        id: '', userId: '', rollNumber: 0
    };

    await queryWithTransaction(statementSelectStudentFromUserId, function scanRows(result: QueryResult<any>): Error | undefined {        

        student = result.rows[0];
        return undefined;             
    }, userId);

    return student;
}

export async function getFaculty(userId: string) {

    let faculty: entity.Faculty = {
        id: '', userId: '', employeeNumber: 0
    };

    await queryWithTransaction(statementSelectFacultyFromUserId, function scanRows(result: QueryResult<any>): Error | undefined {        

        faculty = result.rows[0];
        return undefined;             
    }, userId);

    return faculty;
}

// delete a user based on id.
export async function deleteUser(id: string) {

    await execWithTransaction(statementDeleteUser, id);
}

// no magic, does what the name says
export async function updateFirstName(id: string, firstName: string) {
    
    await execWithTransaction(statementUpdateFirstName, firstName, id);
}

// no magic, does what the name says
export async function updateLastName(id: string, lastName: string) {
    
    await execWithTransaction(statementUpdateLastName, lastName, id);
}

// no magic, does what the name says
export async function updatePassword(id: string, password: string) {
    
    await execWithTransaction(statementUpdatePassword, password, id);
}

export async function updatePreferences(id: string, uiTheme: string, editorTheme: string, wantsEmailNotifications: boolean) {

    await execWithTransaction(statementUpdatePreferences, uiTheme, editorTheme, wantsEmailNotifications, id);
}
