import dotenv from 'dotenv';
import * as cache from '../cache';
import * as database from '../database';
import { UserService } from './UserService';
import * as entity from '../entity';
dotenv.config();

database.setupDatabase(process.env.DATABASE_URL || '');
cache.setupCache(process.env.REDIS_URL || '', 
                    process.env.REDIS_USER || '', process.env.REDIS_PWD || '');

afterAll(async () => await database.terminatePool())

const userService = UserService.getInstance();

test('sign up', async () => {

    const user: entity.User = {
        id: '',
        firstName: 'Aman',
        lastName: 'Bansal',
        email: 'aman@gmail.com',
        password: 'Amanpassword2402@',
        uiTheme: 'light',
        editorTheme: 'light',
        wantsEmailNotifications: true
    };

    const student: entity.Student = {
        id: '',
        userId: '',
        rollNumber: 19070124042
    }
    await userService.signupStudent(user, student);
    await userService.deleteUser(user.id);
});

test('login', async () => {

    const user: entity.User = {
        id: '',
        firstName: 'Naman',
        lastName: 'Bansal',
        email: 'naman@gmail.com',
        password: 'Namanpassword2402@',
        uiTheme: 'light',
        editorTheme: 'light',
        wantsEmailNotifications: true
    };

    const unhashedPassword = user.password;
    const student: entity.Student = {
        id: '',
        userId: '',
        rollNumber: 19070124042
    }
    await userService.signupStudent(user, student);
    const { sessionId } = await userService.login(user.email, unhashedPassword);
    const decoded = await userService.getSessionInfo(sessionId);
    
    if (decoded === undefined) {
        throw new Error('Could not get any data.');
    }

    expect(decoded.userId).toBe(user.id);
    await userService.deleteUser(user.id);
});

test('logout', async () => {

    const user: entity.User = {
        id: '',
        firstName: 'Aman',
        lastName: 'Mittal',
        email: 'aman.mittal@me.com',
        password: 'Amanpassword2402@',
        uiTheme: 'light',
        editorTheme: 'light',
        wantsEmailNotifications: true
    };

    const unhashedPassword = user.password;
    const faculty: entity.Faculty = {
        id: '',
        userId: '',
        employeeNumber: 19070124042
    }
    await userService.signupFaculty(user, faculty);
    const { sessionId } = await userService.login(user.email, unhashedPassword);
    await userService.logout(sessionId);
    const decoded = await userService.getSessionInfo(sessionId);
    if (decoded !== undefined) {
        console.log(decoded);
        throw new Error('session-id still exists in redis.');
    }
    
    await userService.deleteUser(user.id);
    const cacheClient = cache.getClient();
    if (cacheClient.isOpen) {
        cacheClient.disconnect();
    }
});

test('update user fields', async () => {

    const user: entity.User = {
        id: '',
        firstName: 'Alice',
        lastName: 'Wonderland',
        email: 'alice.returns@gmail.com',
        password: 'Alicepassword24@',
        uiTheme: 'light',
        editorTheme: 'light',
        wantsEmailNotifications: true
    }

    const unhashedPassword = user.password;
    const faculty: entity.Faculty = {
        id: '',
        userId: '',
        employeeNumber: 19070124042
    }
    await userService.signupFaculty(user, faculty);
    user.firstName = 'AliceUpdated';
    await userService.updateFirstName(user.email, user.firstName);
    let u = await database.getUser(user.email);
    expect(u.firstName).toBe(user.firstName);


    user.lastName = 'WonderlandUpdated';
    await userService.updateLastName(user.email, user.lastName);
    u = await database.getUser(user.email);
    expect(u.lastName).toBe(user.lastName);

    user.password = 'alicepasswordUpdated1@';
    await userService.updatePassword(user.email, unhashedPassword, user.password);
    await userService.login(user.email, user.password);
    await userService.deleteUser(user.id);
});