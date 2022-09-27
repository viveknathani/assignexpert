import * as express from 'express';
import path from 'path';
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
export default pageRouter;
