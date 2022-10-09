import * as express from 'express';
import { userRouter, injectSessionInfoMiddleWare } from './user';
import codeRouter from './code';
import pageRouter from './pages';
import { classRouter } from './class';
import assignmentRouter from './assignment';
import { submissionRouter } from './submission';

const router: express.Router = express.Router();

router.use('/user', userRouter);
router.use('/code', codeRouter);
router.use(injectSessionInfoMiddleWare);
router.use('/class', classRouter);
router.use('/assignment', assignmentRouter);
router.use('/submission', submissionRouter);

export {
    router as api,
    pageRouter
};
