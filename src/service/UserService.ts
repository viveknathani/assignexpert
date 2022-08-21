import * as cache from '../cache';
import * as entity from '../entity';
import * as database from '../database';
import * as errors from './errors';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export class UserService {

    private static instance: UserService;
    private constructor() {}

     // follows the singleton pattern
     public static getInstance(): UserService {

        if (!UserService.instance) {
            UserService.instance = new UserService();
        }

        return UserService.instance;
    }

    public async signupStudent(user: entity.User, student: entity.Student) {
        
        try {
            await this.signup(user);
            student.userId = user.id;
            await database.insertStudent(student);
        } catch (err) {
            throw err;
        }
    }

    public async signupFaculty(user: entity.User, faculty: entity.Faculty) {
        
        try {
            await this.signup(user);
            faculty.userId = user.id;
            await database.insertFaculty(faculty);
        } catch (err) {
            throw err;
        }
    }

    private async signup(user: entity.User) {

        try {
            if (!this.isValidEmail(user.email)) {
                throw new errors.ErrInvalidEmailFormat;
            }
    
            if (!this.isValidPassword(user.password)) {
                throw new errors.ErrInvalidPasswordFormat;
            }

            const u = await database.getUser(user.email);
            if (u !== undefined && u.id !== '') {
                throw new errors.ErrEmailExists;
            }

            user.password = await bcrypt.hash(user.password, 10) // number of rounds
            await database.insertUser(user);
        } catch (err) {
            throw err;
        }
    }

    // returns a session id if credentials are valid
    public async login(email: string, password: string): Promise<any> {

        try {

            const user = await database.getUser(email);
            if (user === undefined || user.id === undefined || user.id === '') {
                throw new errors.ErrInvalidEmailPassword;
            }

            const isGood = await bcrypt.compare(password, user.password.toString());
            
            if (!isGood) {
                throw new errors.ErrInvalidEmailPassword;
            }

            const temp = await database.getStudent(user.id);
            const sessionId = await this.createSession({
                userId: user.id,
                isStudent: temp !== undefined && temp.id !== ''
            });

            return {
                firstName: user.firstName,
                lastName: user.lastName,
                sessionId,
                uiTheme: user.uiTheme,
                editorTheme: user.editorTheme,
                wantsEmailNotifications: user.wantsEmailNotifications
            }
        } catch (err) {

            throw err;
        }
    }

    // remove session id
    public async logout(sessionId: string) {

        try {
            const cacheClient = cache.getClient();
            
            if (!cacheClient.isOpen) {
                await cacheClient.connect();
            }

            await cacheClient.del(sessionId);
        } catch (err) {
            throw err;
        }
    }

    public async updateFirstName(email: string, firstName: string) {

        try {
            const user = await database.getUser(email);
            if (user.id === '') {
                throw new errors.ErrUpdateUserField;
            }
            await database.updateFirstName(user.id, firstName);
        } catch (err) {
            throw err;
        }
    }

    public async updateLastName(email: string, lastName: string) {

        try {
            const user = await database.getUser(email);
            if (user.id === '') {
                throw new errors.ErrUpdateUserField;
            }
            await database.updateLastName(user.id, lastName);
        } catch (err) {
            throw err;
        }
    }

    public async updatePassword(email: string, oldPassword: string, newPassword: string) {

        try {
            const user = await database.getUser(email);
            if (user.id === '') {
                throw new errors.ErrUpdateUserField;
            }

            const isGood = await bcrypt.compare(oldPassword, user.password.toString());
            if (!isGood) {
                throw new errors.ErrUpdateUserField;
            }

            if (!this.isValidPassword(newPassword)) {
                throw new errors.ErrInvalidPasswordFormat;
            }

            newPassword = await bcrypt.hash(newPassword, 10);
            await database.updatePassword(user.id, newPassword);
        } catch (err) {
            throw err;
        }
    }

    public async updatePreferences(email: string, preferences: entity.Preferences) {
        
        try {
            const user = await database.getUser(email);
            if (user.id === '') {
                throw new errors.ErrUpdateUserField;
            }
            await database.updatePreferences(user.id, preferences.uiTheme, 
                preferences.editorTheme, preferences.wantsEmailNotifications);
        } catch (err) {
            throw err;
        }
    }

    public async deleteUser(id: string) {

        try {
            await database.deleteUser(id);
        } catch (err) {
            throw err;
        }
    }

    private async createSession(sessionInfo: entity.SessionInfo): Promise<string> {

        try {
            const cacheClient = cache.getClient();
            if (!cacheClient.isOpen) {
                await cacheClient.connect();
            }
            const sessionId: string = uuidv4();
            await cacheClient.set(sessionId, JSON.stringify(sessionInfo));
            return sessionId;
        } catch (err) {
            throw err;
        }
    }

    public async getSessionInfo(sessionId: string): Promise<entity.SessionInfo | undefined> {

        try {
            const cacheClient = cache.getClient();
            if (!cacheClient.isOpen) {
                await cacheClient.connect();
            }
            if (sessionId === undefined) {
                return undefined;
            }
            const data = await cacheClient.get(sessionId);
            if (data === undefined || data === null) {
                return undefined;
            }
            return JSON.parse(data);
        } catch (err) {
            throw err;
        }
    }

    private isValidEmail(email: string): boolean {

        const regexEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
        return regexEmail.test(email);
    }

    private isValidPassword(password: string): boolean {

        const minLength = 8
        let length = 0
    
        let hasNumber = false
        let hasUppercase = false
        let hasLowercase = false
        let hasSpecial = false
    
        for (let i = 0; i < password.length; ++i) {

            const c = password[i];

            if (c >= '0' && c <= '9') {
                hasNumber = true;
            } else if (c >= 'a' && c <= 'z') {
                hasLowercase = true;
            } else if (c >= 'A' && c <= 'Z') {
                hasUppercase = true;
            } else if (c >= ' ' && c <= '~') {
                hasSpecial = true;
            } else {
                return false;
            }
            ++length;
        }
    
        return length >= minLength && hasNumber && hasLowercase && hasUppercase && hasSpecial
    }
}


