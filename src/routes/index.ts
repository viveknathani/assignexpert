import * as express from 'express';
import { userRouter, injectSessionInfoMiddleWare } from './user';
import codeRouter from './code';
import pageRouter from './pages';

const router: express.Router = express.Router();

router.use('/user', userRouter);
router.use('/code', codeRouter);
router.use(injectSessionInfoMiddleWare);

export {
    router as api,
    pageRouter
};
