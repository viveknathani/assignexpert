import * as entity from '../entity';
import * as database from '../database';
import * as errors from './errors';

export class AssignmentService {
    private static instance: AssignmentService;
    private constructor() {}

    //follows singleton pattern
    public static getInstance(): AssignmentService {

        if (!AssignmentService.instance) {
            AssignmentService.instance = new AssignmentService();
        }

        return AssignmentService.instance;
    }

    public async insertAssignment(assignmentDetails: entity.AssignmentDetails, isStudent: boolean, facultyId: string) {
        try{
            if(isStudent) {
                throw new errors.ErrInvalidStudentOperation;
            }
            const c = await database.getClass(assignmentDetails.assignment.classId);
            if(c.facultyId != facultyId){
                throw new errors.ErrInvalidFacultyOperation;
            }
            await database.insertAssignment(assignmentDetails);
        } catch (err) {
            throw err;
        }
    }

    public async deleteAssignment(id: string, facultyId: string, isStudent: boolean) {
        try{
            if(isStudent) {
                throw new errors.ErrInvalidStudentOperation;
            }
            const a = await database.getAssignmentDetails(id);
            if(a === undefined || a.assignment.id === ''|| a.assignment.id === undefined) {
                throw new errors.ErrAssignmentNotFound;
            }
            const c = await database.getClass(a.assignment.classId);
            if(c.facultyId != facultyId) {
                throw new errors.ErrInvalidFacultyOperation;
            }
            await database.deleteAssignment(id);
        } catch (err) {
            throw err;
        }
    }

    public async updateAssignment() {
        try{

        } catch (err) {
            throw err;
        }
    }
    
    public async getAllAssignments(classId: string, isStudent: boolean, entityId: string): Promise<entity.AssignmentSummary[]> {
        try {
            let a: entity.AssignmentSummary[] = [];
            if(!isStudent) {
                const c = await database.getClass(classId);
                if(c.facultyId!=entityId){
                    throw new errors.ErrInvalidFacultyOperation;
                }
                a = await database.getAssignmentSummariesForClass(classId);
            } else {
                const isMember = await database.isMember(classId,entityId);
                if(!isMember){
                    throw new errors.ErrInvalidStudentOperation;
                }
                a = await database.getAssignmentSummariesForClass(classId);
                for(let i = 0; i < a.length; i++) {
                    const s: entity.Submission = await database.getMarkedCompleteSubmissionForAssignmentForStudent(a[i].id,entityId);
                    if(s === undefined || s.id === undefined || s.id === '') {
                        a[i].hasCompleted = false;
                    } else {
                        a[i].hasCompleted = true;
                    }
                }
            }
            return a;
        } catch (err) {
            throw err;
        }
    }

    public async getAssignment(assignmentId: string, isStudent: boolean, entityId: string): Promise<entity.AssignmentDetails> {
        try {
            let a: entity.AssignmentDetails = await database.getAssignmentDetails(assignmentId);
            if(a === undefined || a.assignment.id === undefined || a.assignment.id ===''){
                throw new errors.ErrAssignmentNotFound;
            }
            if(!isStudent) {
                const c = await database.getClass(a.assignment.classId);
                if(c.facultyId!=entityId){
                    throw new errors.ErrInvalidFacultyOperation;
                }
                return a;
            } else {
                const isMember = await database.isMember(a.assignment.classId,entityId);
                if(!isMember){
                    throw new errors.ErrInvalidStudentOperation;
                }
                const assignmentDetails: entity.AssignmentDetails = {
                    assignment: a.assignment,
                    templates: a.templates,
                }
                return assignmentDetails;
            }
        } catch (err) {
            throw err;
        }
    }
}