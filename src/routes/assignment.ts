import * as express from 'express';
import { AssignmentService, errors } from '../service';
import * as messages from './http_messages';

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

export default assignmentRouter;
