import * as entity from '../entity/';
import { v4 as uuidv4 } from 'uuid';
import { QueryResult } from 'pg';
import { execWithTransaction, queryWithTransaction } from '.';

const statementInsertClass = `insert into classes (id, "facultyId", name, code) values ($1, $2, $3, $4);`
const statementDeleteClass = "delete from classes where id = $1;"
const statementSelectClassesForFaculty = `select * from classes where "facultyId" = $1;`
const statementSelectClass = "select * from classes where id = $1;"
const statementUpdateClassName = 'update classes set name = $1 where id = $2;'
const statementInsertMember = `insert into members (id, "classId", "studentId") values($1, $2, $3); `
const statementDeleteMember = `delete from members where "classId" = $1 and "studentId" = $2;`
const statementSelectStudentsForClass = `select students.id as id, students."userId" as "userId", students."rollNumber" as "rollNumber" from students,members where "classId" = $1 and members."studentId" = students.id;`
const statementSelectClassesForStudent = `select classes.id as id, classes."facultyId" as "facultyId", classes.name as name, classes.code as code from classes,members where "studentId" = $1 and members."classId" = classes.id;`

// take a class and insert it into the database.
// uuid will be created and assigned before inserting.
export async function insertClass(classEntry: entity.Class) {

    classEntry.id = uuidv4();
    await execWithTransaction(statementInsertClass, classEntry.id, classEntry.facultyId, classEntry.name, classEntry.code);
}

// delete a class based on id.
export async function deleteClass(id: string) {

    await execWithTransaction(statementDeleteClass, id);
}

//select all classes for a faculty
export async function getClassesForFaculty(facultyId: string): Promise<entity.Class[]> {

    const classes: entity.Class[] = [];
    await queryWithTransaction(statementSelectClassesForFaculty, function scanRows(result: QueryResult<any>):Error |undefined {
        for (let i = 0; i<result.rows.length; i++) {
            classes.push(result.rows[i]);
        }
        return undefined;
    },facultyId);
    return classes;
}

//select a class using id
export async function getClass(id: string) {

    let classEntry: entity.Class = {
        id: '', facultyId: '', name: '',code: ''
    };

    await queryWithTransaction(statementSelectClass, function scanRows(result: QueryResult<any>): Error | undefined {        

        classEntry = result.rows[0];
        return undefined;             
    }, id);

    return classEntry;
}

//update name of the class using id
export async function updateName(id: string, name: string) {
    
    await execWithTransaction(statementUpdateClassName, name, id);
}

// take a member and insert it into the database.
// uuid will be created and assigned before inserting.
export async function insertMember(member: entity.Member) {

    member.id = uuidv4();
    await execWithTransaction(statementInsertMember, member.id, member.classId, member.studentId);
}

// delete a student member from a class.
export async function deleteMember(classId: string,studentId: string) {

    await execWithTransaction(statementDeleteMember, classId, studentId);
}

//select all students for a class
export async function getStudentsForClass(classId: string): Promise<entity.Student[]> {

    const students: entity.Student[] = [];
    await queryWithTransaction(statementSelectStudentsForClass, function scanRows(result: QueryResult<any>):Error |undefined {
        for (let i = 0; i<result.rows.length; i++) {
            students.push(result.rows[i]);
        }
        return undefined;
    },classId);
    return students;
}

//select all classes for a student
export async function getClassesForStudent(studentId: string): Promise<entity.Class[]> {

    const classes: entity.Class[] = [];
    await queryWithTransaction(statementSelectClassesForStudent, function scanRows(result: QueryResult<any>):Error |undefined {
        for (let i = 0; i<result.rows.length; i++) {
            classes.push(result.rows[i]);
        }
        return undefined;
    },studentId);
    return classes;
}