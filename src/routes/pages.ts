import * as express from 'express';
import { injectSessionInfoMiddleWare } from './user';
import * as messages from './http_messages';
import path from 'path';
import { AssignmentService, ClassService, errors } from '../service';
import * as ejs from 'ejs';

const pageRouter: express.Router = express.Router();

type ExpressFunction = 
        (req: express.Request, res: express.Response) => Promise<void>

function directoryHandler(webPagePath: string): ExpressFunction {
    return async (req: express.Request, res: express.Response) => {
        try {        
            res.sendFile(path.resolve(__dirname, webPagePath));
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: ''});
        }
    }
}

pageRouter.get('/', directoryHandler('../web/html/index.html'));
pageRouter.get('/run', directoryHandler('../web/html/run.html'));
pageRouter.get('/auth', directoryHandler('../web/html/authPage.html'));
pageRouter.use(injectSessionInfoMiddleWare);
pageRouter.get('/home', directoryHandler('../web/html/home.html'));
pageRouter.get('/settings', directoryHandler('../web/html/settings.html'));
pageRouter.get('/class', async (req: express.Request, res: express.Response) => {
    try {
        const classId = req.query['classId'] as string;
        const { isStudent } = req.body;
        const entityId = (isStudent) ? req.body.studentId : req.body.facultyId;
        const classService = ClassService.getInstance();
        const assignmentService = AssignmentService.getInstance();
        const oneClass = await classService.getClass(classId);
        const members = await classService.getAllStudents(classId);
        const assignments = await assignmentService.getAllAssignments(classId, isStudent, entityId);
        const filePath = path.resolve(__dirname, '../web/html/class.html')
        const html = await ejs.renderFile(filePath, {
            oneClass: { name: "DSA" },
            assignments: [
                {title: "one", difficultyLevel: "EASY"}, 
                {title: "two", difficultyLevel: "MEDIUM"},
                {title: "three", difficultyLevel: "HARD"},
            ],
            members: [19070124042, 19070124043, 19070124043]    
        });
        res.send(html);
    } catch (err) {
        if (err instanceof errors.ErrClassNotFound) {
            res.status(400).json({message: err.message});
            return;
        }
        console.log(err);
        res.status(500).json({message: messages.MESSAGE_500 });
    }
});

export default pageRouter;
