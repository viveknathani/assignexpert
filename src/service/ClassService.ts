import * as entity from '../entity';
import * as database from '../database';
import * as errors from './errors';

export class ClassService {
    private static instance: ClassService;
    private constructor() {}

    //follows singleton pattern
    public static getInstance(): ClassService {

        if (!ClassService.instance) {
            ClassService.instance = new ClassService();
        }

        return ClassService.instance;
    }

    public async insertClass(classEntry: entity.Class, isStudent: boolean): Promise<string> {
        try{
            if(isStudent){
                throw new errors.ErrInvalidStudentOperation;
            }
            const c = await database.getClassFromCode(classEntry.code);
            if (c !== undefined && c.id !== '') {
                throw new errors.ErrCodeExists;
            }
            await database.insertClass(classEntry);
            return classEntry.code;
        } catch (err) {
            throw err;
        }
    }

    public async joinClass(userId: string, code: string, isStudent: boolean) {
        try{
            if(!isStudent){
                throw new errors.ErrInvalidFacultyOperation;
            }
            const c: entity.Class = await database.getClassFromCode(code);
            if (c === undefined || c.id === ''|| c.id === undefined) {
                throw new errors.ErrClassNotFound;
            }
            const s: entity.Student = await database.getStudent(userId);
            const m: entity.Member = {
                id: '', classId: c.id, studentId: s.id
            }       
            await database.insertMember(m);   
        } catch (err) {
            throw err;
        }
    }

    public async updateClassName(id: string, facultyId: string, isStudent: boolean, newName: string){
        try {
            if(isStudent){
                throw new errors.ErrInvalidStudentOperation;
            }
            const c = await database.getClass(id);
            if(c === undefined || c.id === undefined || c.id===''){
                throw new errors.ErrClassNotFound;
            }
            if(c.facultyId != facultyId) {
                throw new errors.ErrInvalidFacultyOperation;
            }
            await database.updateName(id,newName);            
        } catch (err) {
            throw err;
        }
    }

    public async getAllStudents(id: string): Promise<entity.Student[] | undefined> {
        try{
            const c = await database.getClass(id);
            if(c === undefined || c.id === undefined || c.id===''){
                throw new errors.ErrClassNotFound;
            }
            const students = await database.getStudentsForClass(id);
            return students;
        } catch (err) {
            throw err;
        }
    }

    public async getAllClasses(id: string, isStudent: boolean): Promise<entity.Class[] | undefined> {
        try{
            if(isStudent) {
                const s: entity.Student = await database.getStudent(id);
                const classes = await database.getClassesForStudent(s.id);
                return classes;
            }
            else {
                const f: entity.Faculty = await database.getFaculty(id);
                const classes = await database.getClassesForFaculty(f.id);
                return classes;
            }
        } catch (err) {
            throw err;
        }
    }

    public async getClass(id: string): Promise<entity.Class | undefined> {
        try {
            const oneClass = await database.getClass(id);
            if (oneClass === undefined || oneClass.id === '') {
                throw new errors.ErrClassNotFound;
            }
            return oneClass;
        } catch (err) {
            throw err;
        }
    }
}