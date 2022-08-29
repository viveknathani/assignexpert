import dotenv from 'dotenv';
dotenv.config();

import { setupDatabase, terminatePool } from '.';
import * as entity from '../entity/';
import { insertClass, deleteClass, getClassesForFaculty, getClassFromCode, updateName, insertMember, deleteMember, getStudentsForClass, getClassesForStudent } from './class';
import { deleteUser, insertFaculty, insertStudent, insertUser } from './user';

setupDatabase(process.env.DATABASE_URL || '');
afterAll(async () => await terminatePool())

test('insert/get/update/delete class', async () => {

    const user1: entity.User = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'binny@gmail.com',
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
        email: 'alicebinny@gmail.com',
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
        id: '',
        studentId: student1.id,
        classId: class1.id
    });
    
    class1.name = "DSA";
    await updateName(class1.id,class1.name);

    const c: entity.Class = await getClassFromCode(class1.code);
    expect(c.id).toEqual(class1.id);
    
    const classes: entity.Class[] = await getClassesForFaculty(faculty1.id);
    expect(classes[0].id).toEqual(class1.id);

    const students: entity.Student[] = await getStudentsForClass(class1.id);
    expect(students[0].id).toEqual(student1.id);

    const classesofs1: entity.Class[] = await getClassesForStudent(student1.id);
    expect(classesofs1[0].id).toEqual(class1.id);

    await deleteMember(class1.id,student1.id);
    await deleteClass(class1.id);
    await deleteUser(user1.id);
    await deleteUser(user2.id);
});