import dotenv from 'dotenv';
import * as database from '../database';
import * as cache from '../cache';
import { UserService } from './UserService';
import { ClassService } from './ClassService';
import * as entity from '../entity';
dotenv.config();

database.setupDatabase(process.env.DATABASE_URL || '');
cache.setupCache(process.env.REDIS_URL || '', 
                    process.env.REDIS_USER || '', process.env.REDIS_PWD || '');
afterAll(async () => await database.terminatePool());

const userService = UserService.getInstance();
const classService = ClassService.getInstance();

const user1: entity.User = {
    id: '1',
    firstName: 'Naman',
    lastName: 'Bansal',
    email: 'naman.bansal@gmail.com',
    password: 'Namanpassword191@',
    uiTheme: 'light',
    editorTheme: 'light',
    wantsEmailNotifications: true
};
const unhashedUser1Password = user1.password;
const student: entity.Student = {
    id: '1',
    userId: user1.id,
    rollNumber: 19070122191
}

const user2: entity.User = {
    id: '2',
    firstName: 'Aman',
    lastName: 'Mittal',
    email: 'aman.mit@me.com',
    password: 'Amanpassword191@',
    uiTheme: 'light',
    editorTheme: 'light',
    wantsEmailNotifications: true
};
const unhashedUser2Password = user2.password;
const faculty: entity.Faculty = {
    id: '1',
    userId: user2.id,
    employeeNumber: 19070122191
}

const class1: entity.Class = {
    id: '1',
    facultyId: faculty.id,
    name: 'Cloud Computing',
    code: ''
};

test('insert/update/get class for faculty', async () => {

    await userService.signupFaculty(user2, faculty);    
    const { sessionId } = await userService.login(user2.email, unhashedUser2Password);
    const decoded = await userService.getSessionInfo(sessionId);
    if (decoded === undefined) {
        throw new Error('Could not get any data.');
    }
    class1.facultyId = faculty.id;
    await classService.insertClass(class1,decoded.isStudent);
    
    await classService.updateClassName(class1.id,class1.facultyId,decoded.isStudent, 'DSA');

    const c: entity.Class[]|undefined = await classService.getAllClasses(user2.id,decoded.isStudent);
    if(c != undefined){
        expect(c[0].id).toEqual(class1.id);
        expect(c[0].name).toEqual('DSA');
    }
    await userService.logout(sessionId);
});

test('join/get class for student', async () => {

    await userService.signupStudent(user1, student);
    const { sessionId } = await userService.login(user1.email, unhashedUser1Password);
    const decoded = await userService.getSessionInfo(sessionId);
    if (decoded === undefined) {
        throw new Error('Could not get any data.');
    }

    await classService.joinClass(user1.id, class1.code, decoded.isStudent);
    const students: entity.Student[] | undefined = await classService.getAllStudents(class1.id);
    if(students != undefined) {
        expect(students[0].userId).toEqual(user1.id);
    }
    const classes : entity.Class[] | undefined = await classService.getAllClasses(user1.id, decoded.isStudent);
    if(classes != undefined) {
        expect(classes[0].id).toEqual(class1.id);
    }
    await userService.logout(sessionId);
    await database.deleteClass(class1.id);
    await userService.deleteUser(user1.id);
    await userService.deleteUser(user2.id);
});