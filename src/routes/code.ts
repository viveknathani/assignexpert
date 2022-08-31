import * as express from 'express';
import * as messages from './http_messages';
import { CodeExecutionService, errors } from '../service';

const codeRouter: express.Router = express.Router();
const codeExecutionService: CodeExecutionService = CodeExecutionService.getInstance();

codeRouter.post('/run', async (req: express.Request, res: express.Response) => {
    try {
        const jobId = codeExecutionService.runCode(req.body);
        res.status(201).json({jobId});
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: messages.MESSAGE_500 });
    }
});

codeRouter.get('/result', async (req: express.Request, res: express.Response) => {
    try {
        const jobId = req.query.jobId as string;
        const data = await codeExecutionService.getJobResult(jobId);
        if (data !== undefined) {
            res.status(200).json(data);
        } else {
            res.status(204).json({ message: messages.MESSAGE_204 });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: messages.MESSAGE_500 });
    }
});

export default codeRouter;
