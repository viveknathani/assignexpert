import * as express from 'express';
import { ClassService, AssignmentService, errors } from '../service';
import * as messages from './http_messages';

const classRouter: express.Router = express.Router();
const classService: ClassService = ClassService.getInstance();
const assignmentService: AssignmentService = AssignmentService.getInstance();

/**
 * @api {post} /api/class/ Insert class
 * @apiGroup Class
 * @apiName Insert class
 * @apiBody {string} name Mandatory
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiSuccess {string} code class code
 * @apiVersion 0.1.0
 * @apiDescription User needs to be authenticated befor this step.
 */
classRouter.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const classCode = await classService.insertClass({
            id:'', 
            facultyId:req.body.facultyId, 
            name:req.body.name, code: ''
        },req.body.isStudent);
        res.status(200).json({ code: classCode });
    } catch (err) {
        if (err instanceof errors.ErrInvalidStudentOperation) {
                res.status(400).json({ message: err.message });
                return;
        }
        console.log(err);
        res.status(500).json({ message: messages.MESSAGE_500 });
    }
});


/**
 * @api {post} /api/class/join Join class
 * @apiGroup Class
 * @apiName Join class
 * @apiBody {string} code Mandatory, class code
 * @apiError (ClientError) {json} 400 InvalidFacultyOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 * @apiDescription User needs to be authenticated befor this step.
 */
 classRouter.post('/join', async (req: express.Request, res: express.Response) => {
    try {
        await classService.joinClass(req.body.userId,req.body.code,req.body.isStudent);
        res.status(201).json({ message: messages.MESSAGE_201 });
    } catch (err) {
        if (err instanceof errors.ErrInvalidFacultyOperation) {
                res.status(400).json({ message: err.message });
                return;
        }
        console.log(err);
        res.status(500).json({ message: messages.MESSAGE_500 });
    }
});


/**
 * @api {put} /api/class/name Update class name
 * @apiGroup Class
 * @apiName Update class name
 * @apiBody {string} classId Mandatory, class id
 * @apiBody {string} newName  Mandatory, the new class name 
 * @apiError (ClientError) {json} 400 ErrInvalidStudentOperation or ErrClassNotFound or ErrInvalidFacultyOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 * @apiDescription This will only update the database. In order to reflect
 * the changes in the user interface, a refresh or view update might be needed.
 * User needs to be authenticated to hit this endpoint.
 */
classRouter.put('/name', async (req: express.Request, res: express.Response) => {
    try {
        await classService.updateClassName(req.body.classId, req.body.facultyId,
            req.body.isStudent, req.body.newName);
        res.status(204).json({ message: messages.MESSAGE_204 });
    } catch (err) {
        if (err instanceof errors.ErrInvalidStudentOperation
            || err instanceof errors.ErrClassNotFound
            || err instanceof errors.ErrInvalidFacultyOperation) {
            res.status(400).json({ message: err.message });
            return;
        }
        console.log(err);
        res.status(500).json({ message: messages.MESSAGE_500 });
    }
});


/**
 * @api {get} /api/class/:classId/students Get all students
 * @apiGroup Class
 * @apiName Get all students
 * @apiParam {string} classId, class id
 * @apiError (ClientError) {json} 400 ErrClassNotFound
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 */
classRouter.get('/:classId/students',async (req: express.Request, res: express.Response) => {
    try{
        const classId = req.params.classId
        const students = await classService.getAllStudents(classId);
        res.status(200).json(students);
    }catch (err) {
        if (err instanceof errors.ErrClassNotFound) {
            res.status(400).json({ message: err.message });
            return;
        }
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500 });
    }
});



/**
 * @api {get} /api/class/all Get Classes
 * @apiGroup Class
 * @apiName Get Classes
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 */
 classRouter.get('/all',async (req: express.Request, res: express.Response) => {
    try{
        const classes = await classService.getAllClasses(req.body.userId, req.body.isStudent);
        res.status(200).json(classes);
    }catch (err) {
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500 });
    }
});

/**
 * @api {get} /api/class/:classId/code Get class code
 * @apiGroup Class
 * @apiName Get class code
 * @apiParam {string} classId, class id
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 */
classRouter.get('/:classId/code',async (req: express.Request, res: express.Response) => {
    try {
        const classId = req.params.classId;
        res.status(200).json({code: classId})
    } catch (err) {
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500 });
    }    
})

/**
 * @api {get} /api/class/:classId/assignments Get all assignments
 * @apiGroup Class
 * @apiName Get all assignments
 * @apiParam {string} classId, Mandatory
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ClientError) {json} 400 InvalidFacultyOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 */
 classRouter.get('/:classId/assignments', async (req: express.Request, res: express.Response) => {
    try {
        const classId = req.params.classId;
        const { isStudent } = req.body;
        const entityId = (isStudent) ? req.body.studentId : req.body.facultyId;
        const assignments = await assignmentService.getAllAssignments(classId, isStudent, entityId);
        res.status(200).json(assignments);
    } catch (err) {
        if (err instanceof errors.ErrInvalidFacultyOperation
            || err instanceof errors.ErrInvalidStudentOperation) {
            res.status(400).json({ message: err.message });
            return;
        }
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500})
    }
});

export {
    classRouter
};