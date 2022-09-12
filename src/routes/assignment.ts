import * as express from 'express';
import { AssignmentService, errors } from '../service';
import * as messages from './http_messages';
import * as entity from '../entity';

const assignmentRouter: express.Router = express.Router();
const assignmentService: AssignmentService = AssignmentService.getInstance();

/**
 * @api {post} /api/assignment/ Insert assignment
 * @apiGroup Assignment
 * @apiName Insert assignment
 * @apiBody {Assignment} assignment Mandatory, an object described below
 * @apiBody {string} assignment.id Mandatory, leave ""
 * @apiBody {string} assignment.classId Mandatory
 * @apiBody {string} assignment.classId Mandatory
 * @apiBody {string} assignment.title Mandatory
 * @apiBody {string} assignment.description Mandatory
 * @apiBody {string} assignment.sampleInput Mandatory
 * @apiBody {string} assignment.sampleOutput Mandatory
 * @apiBody {string} assignment.constraints Mandatory
 * @apiBody {number} assignment.timeLimitSeconds Mandatory
 * @apiBody {number} assignment.memoryLimitMB Mandatory
 * @apiBody {number} assignment.points Mandatory
 * @apiBody {boolean} assignment.hasTemplate Mandatory
 * @apiBody {[]string} assignment.acceptedLanguages Mandatory, each element has to be one of {c, cpp, java, python} 
 * @apiBody {boolean} assignment.holdPoints Mandatory
 * @apiBody {string} assignment.deadline Mandatory, format: yyyy-mm-dd
 * @apiBody {string} assignment.difficultyLevel Mandatory, has to be one of: {EASY, MEDIUM, DIFFICULT}
 * @apiBody {[]Template} templates Optional, needed only if hasTemplate is true
 * @apiBody {string} template.id Mandatory, leave ""
 * @apiBody {string} template.assignmentId Mandatory, leave ""
 * @apiBody {string} template.lang Mandatory, has to be one of: {c, cpp, java, python}
 * @apiBody {string} template.snippet Mandatory
 * @apiBody {string} template.preSnippet Mandatory
 * @apiBody {string} template.postSnippet Mandatory
 * @apiBody {AssignmentTestCase} testCases Mandatory
 * @apiBody {string} testCase.id Mandatory, leave ""
 * @apiBody {string} testCase.assignmentId Mandatory, leave ""
 * @apiBody {number} testCase.points Mandatory
 * @apiBody {string} testCase.input Mandatory
 * @apiBody {string} testCase.output Mandatory
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ClientError) {json} 400 InvalidFacultyOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 * @apiDescription User needs to be authenticated befor this step.
 */
assignmentRouter.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const { isStudent, facultyId } = req.body;
        await assignmentService.insertAssignment(req.body, isStudent, facultyId);
        res.status(201).json({messages: messages.MESSAGE_201});
    } catch (err) {
        if (err instanceof errors.ErrInvalidFacultyOperation
            || err instanceof errors.ErrInvalidStudentOperation) {
            res.status(400).json({ message: err.message });
            return;
        }
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500});
    }
});

/**
 * @api {post} /api/assignment/ Delete assignment
 * @apiGroup Assignment
 * @apiName Delete assignment
 * @apiBody {string} assignmentId Mandatory
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ClientError) {json} 400 InvalidFacultyOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 * @apiDescription User needs to be authenticated befor this step.
 */
assignmentRouter.delete('/', async (req: express.Request, res: express.Response) => {
    try {
        const { isStudent, facultyId } = req.body;
        await assignmentService.deleteAssignment(req.body.assignmentId, facultyId, isStudent);
        res.status(204).json({message: messages.MESSAGE_204});
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

/**
 * @api {get} /api/assignment/all Get all assignments
 * @apiGroup Assignment
 * @apiName Get all assignments
 * @apiQuery {string} classId, Mandatory
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ClientError) {json} 400 InvalidFacultyOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 */
assignmentRouter.get('/all', async (req: express.Request, res: express.Response) => {
    try {
        const classId = req.query['classId'] as string;
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

/**
 * @api {get} /api/assignment Get an assignment
 * @apiGroup Assignment
 * @apiName Get an assignment
 * @apiQuery {string} assignmentId, Mandatory
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ClientError) {json} 400 InvalidFacultyOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 */
 assignmentRouter.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const assignmentId = req.query['assignmentId'] as string;
        const { isStudent } = req.body;
        const entityId = (isStudent) ? req.body.studentId : req.body.facultyId;
        const assignment = await assignmentService.getAssignment(assignmentId, isStudent, entityId);
        res.status(200).json(assignment);
    } catch (err) {
        if (err instanceof errors.ErrInvalidFacultyOperation
            || err instanceof errors.ErrInvalidStudentOperation
            || err instanceof errors.ErrAssignmentNotFound) {
            res.status(400).json({ message: err.message });
            return;
        }
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500})
    }
});

/**
 * @api {post} /api/assignment/submission Make a submission
 * @apiGroup Assignment
 * @apiName Make a submission
 * @apiBody {string} assignmentId Mandatory
 * @apiBody {string} code Mandatory
 * @apiBody {string} lang Mandatory
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 * @apiDescription User needs to be authenticated befor this step.
 */
assignmentRouter.post('/submission', async (req: express.Request, res: express.Response) => {
    try {
        const { assignmentId, code, lang } = req.body;
        const jobId = await assignmentService.makeSubmission({
            id: '',
            studentId: req.body.studentId,
            assignmentId: assignmentId,
            code: code,
            lang: lang,
            markCompleted: false,
            resultStatus: entity.ResultStatus.NA,
            resultMessage: '',
            timeTaken: 0,
            memoryUsedInKiloBytes: 0,
            points: 0,
            submittedAt: new Date(),
        });
        res.status(201).json({jobId});
    } catch (err) {
        if (err instanceof errors.ErrAssignmentAlreadyCompleted) {
            res.status(400).json({ message: err.message });
            return;
        }
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500})
    }
});

/**
 * @api {put} /api/assignment/submission Mark submission complete
 * @apiGroup Assignment
 * @apiName Make submission complete
 * @apiBody {string} submissionId Mandatory
 * @apiError (ClientError) {json} 400 AssignmentAlreadyCompleted
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 * @apiDescription User needs to be authenticated befor this step.
 */

assignmentRouter.put('/submission/complete', async (req: express.Request, res: express.Response) => {
    try {
        const { studentId, submissionId } = req.body;
        await assignmentService.markSubmissionAsComplete(studentId, submissionId);
        res.status(204).json({ message: messages.MESSAGE_204 });
    } catch (err) {
        if (err instanceof errors.ErrInvalidStudentOperation) {
            res.status(400).json({ message: err.message });
            return;
        }
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500})
    }
});

/**
 * @api {get} /api/assignment Get a submission
 * @apiGroup Assignment
 * @apiName Get a submission
 * @apiQuery {string} submissionId, Mandatory
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ClientError) {json} 400 InvalidFacultyOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 */
assignmentRouter.get('/submission', async (req: express.Request, res: express.Response) => {
    try {
        const submissionId = req.query['submissionId'] as string;
        const data = await assignmentService.getSubmission(submissionId);
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500})
    }
});

/**
 * @api {get} /api/assignment Get all submission
 * @apiGroup Assignment
 * @apiName Get all submissions
 * @apiQuery {string} assignmentId, Mandatory
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ClientError) {json} 400 InvalidFacultyOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 */
 assignmentRouter.get('/submissions', async (req: express.Request, res: express.Response) => {
    try {
        const { isStudent } = req.body;
        const entityId = (isStudent) ? req.body.studentId : req.body.facultyId;
        const assignmentId = req.query['assignmentId'] as string;
        const data = await assignmentService.getAllSubmissionsForAssignment(assignmentId, entityId, isStudent);
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500})
    }
});

export default assignmentRouter;
