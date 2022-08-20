import * as express from 'express';
import { userRouter, injectSessionInfoMiddleWare } from './user';

const router: express.Router = express.Router();

router.use('/user', userRouter);
router.use(injectSessionInfoMiddleWare);
export default router;
