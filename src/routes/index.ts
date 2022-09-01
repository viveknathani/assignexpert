import * as express from 'express';
import { userRouter, injectSessionInfoMiddleWare } from './user';
import codeRouter from './code';
import pageRouter from './pages';
import { classRouter } from './class';

const router: express.Router = express.Router();

router.use('/user', userRouter);
router.use('/code', codeRouter);
router.use(injectSessionInfoMiddleWare);
router.use('/class', classRouter);

export {
    router as api,
    pageRouter
};
