import * as express from 'express';
import { AssignmentService, errors } from '../service';
import * as messages from './http_messages';
import * as entity from '../entity';
import * as path from 'path';

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
 * @apiBody {[]AssignmentTestCase} testCases Mandatory
 * @apiBody {string} testCase.id Mandatory, leave ""
 * @apiBody {string} testCase.assignmentId Mandatory, leave ""
 * @apiBody {number} testCase.points Mandatory
 * @apiBody {string} testCase.input Mandatory
 * @apiBody {string} testCase.output Mandatory
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ClientError) {json} 400 InvalidFacultyOperation
 * @apiError (ClientError) {json} 400 NonPositivePointsForTestCase
 * @apiError (ClientError) {json} 400 TotalPointsNotEqualAssignmentPoints
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
            || err instanceof errors.ErrInvalidStudentOperation || err instanceof errors.ErrNonPositivePointsForTestcase
            || err instanceof errors.ErrTotalPointsNotEqualAssignmentPoints) {
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
 * @api {get} /api/assignment/:assignmentId Get an assignment
 * @apiGroup Assignment
 * @apiName Get an assignment
 * @apiParam {string} assignmentId, Mandatory
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ClientError) {json} 400 InvalidFacultyOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 */
 assignmentRouter.get('/:assignmentId', async (req: express.Request, res: express.Response) => {
    try {
        const assignmentId = req.params.assignmentId;
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
 * @api {get} /api/assignment/:assignmentId/submissions Get all submissions
 * @apiGroup Assignment
 * @apiName Get all submissions
 * @apiParam {string} assignmentId, Mandatory
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ClientError) {json} 400 InvalidFacultyOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 */
 assignmentRouter.get('/:assignmentId/submissions', async (req: express.Request, res: express.Response) => {
    try {
        const { isStudent } = req.body;
        const entityId = (isStudent) ? req.body.studentId : req.body.facultyId;
        const assignmentId = req.params.assignmentId;
        const data = await assignmentService.getAllSubmissionsForAssignment(assignmentId, entityId, isStudent);
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500})
    }
});

/**
 * @api {put} /api/assignment Update assignment
 * @apiGroup Assignment
 * @apiName Update assignment
 * @apiBody {string} id, Mandatory
 * @apiBody {string} text, Optional
 * @apiBody {string} description, Optional
 * @apiBody {string} sampleInput, Optional
 * @apiBody {string} sampleOutput, Optional
 * @apiBody {string} constraints, Optional
 * @apiBody {number} timeLimitSeconds, Optional
 * @apiBody {number} memoryLimitMB, Optional
 * @apiBody {number} points, Optional
 * @apiBody {string} deadline, Optional
 * @apiBody {string} difficultyLevel, Optional
 * @apiBody {[]Template} templates, Optional
 * @apiBody {string} template.id, Mandatory
 * @apiBody {string} template.lang Optional, has to be one of: {c, cpp, java, python}
 * @apiBody {string} template.snippet Optional
 * @apiBody {string} template.preSnippet Optional
 * @apiBody {string} template.postSnippet Optional
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ClientError) {json} 400 InvalidFacultyOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 */
assignmentRouter.put('/', async (req: express.Request, res: express.Response) => {
    try {
        const { isStudent, facultyId, templates } = req.body;
        await assignmentService.updateAssignment(req.body.assignment, req.body?.templates || [], isStudent, facultyId);
        res.status(204).json({message: messages.MESSAGE_204});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500});
    }
});


/**
 * @api {get} /api/assignment/:assignmentId/download Get excel file with points
 * @apiGroup Assignment
 * @apiName Get excel file with points
 * @apiParam {string} assignmentId, Mandatory
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ClientError) {json} 400 InvalidFacultyOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 */
 assignmentRouter.get('/:assignmentId/download', async (req: express.Request, res: express.Response) => {
    try {
        const { isStudent } = req.body;
        const entityId = (isStudent) ? req.body.studentId : req.body.facultyId;
        const assignmentId = req.params.assignmentId;
        const fileName = await assignmentService.getResult(assignmentId, entityId, isStudent);
        res.download(fileName);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500})
    }
});

export default assignmentRouter;
