import * as express from 'express';
import { AssignmentService, errors } from '../service';
import * as messages from './http_messages';
import * as entity from '../entity';

const submissionRouter: express.Router = express.Router();
const assignmentService: AssignmentService = AssignmentService.getInstance();

/**
 * @api {get} /api/submission/:submissionId Get a submission
 * @apiGroup Submission
 * @apiName Get a submission
 * @apiParam {string} submissionId Mandatory
 * @apiSuccess {Object} submission Details of the submission.
 * @apiSuccess {string} submission.id submissionId.
 * @apiSuccess {string} submission.assignmentId assignmentId.
 * @apiSuccess {string} submission.studentId studentId.
 * @apiSuccess {string} submission.code Code submitted by the student.
 * @apiSuccess {string} submission.lang One of: {c, cpp, java, python}.
 * @apiSuccess {string} submission.resultStatus One of: {AC, WA, TLE, MLE, CE, RE, PR, NA}. 
 * @apiSuccess {number} submission.timeTaken Time taken by the code to execute.
 * @apiSuccess {number} submission.memoryUsedInKiloBytes Memory used by the code to execute.
 * @apiSuccess {number} submission.points Points received for the code.
 * @apiSuccess {string} submission.submittedAt Date of submission in format: yyyy-mm-dd.
 * @apiSuccess {boolean} submission.markCompleted Cannot do further submissions if this is true.
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ClientError) {json} 400 InvalidFacultyOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 */
submissionRouter.get('/:submissionId', async (req: express.Request, res: express.Response) => {
    try {
        const submissionId = req.params.submissionId;
        const data = await assignmentService.getSubmission(submissionId);
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500})
    }
});

/**
 * @api {post} /api/submission Make a submission
 * @apiGroup Submission
 * @apiName Make a submission
 * @apiBody {string} assignmentId Mandatory
 * @apiBody {string} code Mandatory
 * @apiBody {string} lang Mandatory
 * @apiSuccess {string} jobId Similar to submissionId for easier access.
 * @apiError (ClientError) {json} 400 LateSubmissionNotAllowed
 * @apiError (ClientError) {json} 400 AssigmentAlreadyCompleted
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 * @apiDescription User needs to be authenticated befor this step.
 */
submissionRouter.post('/', async (req: express.Request, res: express.Response) => {
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
        if (err instanceof errors.ErrAssignmentAlreadyCompleted || err instanceof errors.ErrLateSubmissionNotAllowed) {
            res.status(400).json({ message: err.message });
            return;
        }
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500})
    }
});

/**
 * @api {put} /api/submission/complete Mark submission complete
 * @apiGroup Submission
 * @apiName Mark submission complete
 * @apiBody {string} submissionId Mandatory
 * @apiSuccess {string} message Updated. No content returned.
 * @apiError (ClientError) {json} 400 AssignmentAlreadyCompleted
 * @apiError (ClientError) {json} 400 LateSubmissionNotAllowed
 * @apiError (ClientError) {json} 400 InvalidStudentOperation
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 * @apiDescription User needs to be authenticated befor this step.
 */

submissionRouter.put('/complete', async (req: express.Request, res: express.Response) => {
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


export {
    submissionRouter
}