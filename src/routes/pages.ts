import * as express from 'express';
import path from 'path';
const pageRouter: express.Router = express.Router();

pageRouter.get('/run', async (req: express.Request, res: express.Response) => {
    try {        
        res.sendFile(path.resolve(__dirname,'../web/html/run.html'));
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: ''});
    }
});

export default pageRouter;
