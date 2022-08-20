import dotenv from 'dotenv';
dotenv.config();

import { setupDatabase, terminatePool } from '.';
import * as entity from '../entity/';
import { deleteUser, getUser, insertUser, updateFirstName, updateLastName, updatePassword, updatePreferences } from './user';


setupDatabase(process.env.DATABASE_URL || '');
afterAll(async () => await terminatePool())

test('insert/get/delete user', async () => {

    const user: entity.User = {
        id: '',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@gmail.com',
        password: 'johnpassword',
        uiTheme: 'light',
        editorTheme: 'light',
        wantsEmailNotifications: true
    }

    await insertUser(user);
    const u = await getUser(user.email);
    u.password = u.password.toString();
    expect(user).toEqual(u);
    deleteUser(user.id);
});

test('update user fields', async () => {

    const user: entity.User = {
        id: '',
        firstName: 'Alice',
        lastName: 'Wonderland',
        email: 'alice@gmail.com',
        password: 'alicepassword',
        uiTheme: 'light',
        editorTheme: 'light',
        wantsEmailNotifications: true
    }

    await insertUser(user);
    user.firstName = 'AliceUpdated';
    await updateFirstName(user.id, user.firstName);
    let u = await getUser(user.email);
    expect(u.firstName).toBe(user.firstName);

    user.lastName = 'WonderlandUpdated';
    await updateLastName(user.id, user.lastName);
    u = await getUser(user.email);
    expect(u.lastName).toBe(user.lastName);

    user.password = 'alicepasswordUpdated';
    await updatePassword(user.id, user.password);
    u = await getUser(user.email);
    expect(u.password.toString()).toBe(user.password);

    user.editorTheme = 'dark';
    user.wantsEmailNotifications = false;
    await updatePreferences(user.id, user.uiTheme, user.editorTheme, user.wantsEmailNotifications);
    u = await getUser(user.email);
    expect(u.editorTheme).toBe(user.editorTheme);
    expect(u.wantsEmailNotifications).toBe(user.wantsEmailNotifications);

    await deleteUser(user.id);
});