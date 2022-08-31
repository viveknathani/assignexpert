import * as express from 'express';
import { userRouter, injectSessionInfoMiddleWare } from './user';
import { classRouter } from './class';

const router: express.Router = express.Router();

router.use('/user', userRouter);
router.use(injectSessionInfoMiddleWare);
router.use('/class', classRouter);
export default router;
