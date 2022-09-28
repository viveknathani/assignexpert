import * as express from 'express';
import { UserService, errors } from '../service';
import * as messages from './http_messages';

const userRouter: express.Router = express.Router();
const userService: UserService = UserService.getInstance();

// returns cookie config depending on environment
function getCookieConfig(): express.CookieOptions {

    if (process.env.NODE_ENV === 'production') {
        return {
            maxAge: 86400000, // 1 day in ms
            httpOnly: true, // prevent attackers from stealing
            secure: true,
            sameSite: 'strict'    
        }
    }
    return {
        maxAge: 86400000, // 1 day in ms
        httpOnly: false,
        secure: false,
        sameSite: 'strict'
    }
}

async function injectSessionInfoMiddleWare(req: express.Request, res: express.Response, 
    next: express.NextFunction) {
        try {
            const sessionId = req.cookies['session'];
            const sessionInfo = await userService.getSessionInfo(sessionId);
            if (sessionInfo === undefined) {
                if (!req.path.startsWith('/api') && req.path !== '/') {
                    res.redirect('/auth');
                    return;
                }
                res.status(400).json({ message: 'you need to authenticate' });
                return;
            }
            req.body.userId = sessionInfo.userId;
            req.body.isStudent = sessionInfo.isStudent;
            if (sessionInfo.isStudent) {
                req.body.studentId = sessionInfo.studentId
            } else {
                req.body.facultyId = sessionInfo.facultyId
            }
            next();
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: messages.MESSAGE_500 });
        }
}

/**
 * @api {post} /api/user/signup Signup
 * @apiGroup User
 * @apiName Signup
 * @apiBody {boolean} isStudent Mandatory
 * @apiBody {string} firstName Mandatory 
 * @apiBody {string} lastName  Mandatory 
 * @apiBody {string} email     Mandatory 
 * @apiBody {string} password  Mandatory (format: Min. 8 chars, atleast 1 number, 1 lowercase character, 1 uppercase character, 1 special character)
 * @apiBody {number} rollNumber Mandatory if isStudent is true
 * @apiBody {number} employeeNumber Mandatory if isStudent is false
 * @apiError (ClientError) {json} 400 InvalidEmailFormat or InvalidPasswordFormat or InvalidPasswordFormat
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 */
userRouter.post('/signup', async (req: express.Request, res: express.Response) => {
    try {
        const { isStudent } = req.body;
        if (isStudent) {
            await userService.signupStudent(req.body, {
                id: '', userId: '', rollNumber: req.body.rollNumber
            });
        } else {
            await userService.signupFaculty(req.body, {
                id: '', userId: '', employeeNumber: req.body.employeeNumber
            });
        }
        res.status(201).json({ message: messages.MESSAGE_201 });
    } catch (err) {
        if (err instanceof errors.ErrInvalidEmailFormat
            || err instanceof errors.ErrInvalidPasswordFormat
            || err instanceof errors.ErrEmailExists) {
                res.status(400).json({ message: err.message });
                return;
        }
        console.log(err);
        res.status(500).json({ message: messages.MESSAGE_500 });
    }
});

/**
 * @api {post} /api/user/login Login
 * @apiGroup User
 * @apiName Login
 * @apiBody {string} email     Mandatory 
 * @apiBody {string} password  Mandatory
 * @apiError (ClientError) {json} 400 InvalidEmailPassword
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiSuccess {string} firstName First name of the user.
 * @apiSuccess {string} lastName Lastt name of the user.
 * @apiVersion 0.1.0
 * @apiDescription HTTP-only cookie is set.
 */
userRouter.post('/login', async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;
        const response = await userService.login(email, password);
        res.cookie('session', response.sessionId, getCookieConfig());
        res.status(200).json({
            firstName: response.firstName,
            lastName: response.lastName,
            uiTheme: response.uiTheme,
            editorTheme: response.editorTheme,
            wantsEmailNotifications: response.wantsEmailNotifications,
            isStudent: response.isStudent
        });
    } catch (err) {
        if (err instanceof errors.ErrInvalidEmailPassword) {
            res.status(400).json({ message: err.message });
            return;
        }
        console.log(err);
        res.status(500).json({ message: messages.MESSAGE_500 });
    }
});

/**
 * @api {post} /api/user/logout Logout
 * @apiGroup User
 * @apiName Logout
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 * @apiDescription The HTTP-only cookie set during login will be used.
 */
userRouter.post('/logout', async (req: express.Request, res: express.Response) => {
    try {
        await userService.logout(req.cookies['session']);
        res.clearCookie('session');
        res.status(200).json({ message: messages.MESSAGE_200 });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: messages.MESSAGE_500 });
    }
});

userRouter.use('/', injectSessionInfoMiddleWare);

/**
 * @api {put} /api/user/ Update user fields
 * @apiGroup User
 * @apiName Update user fields 
 * @apiBody {string} firstName Optional
 * @apiBody {string} lastName Optional
 * @apiBody {string} oldPassword Optional
 * @apiBody {string} newPassword Optional (oldPassword is also required)
 * @apiBody {string} preferences.uiTheme Optional
 * @apiBody {string} preferences.editorTheme  Optional
 * @apiBody {boolean} preferences.wantsEmailNotifications  Optional
 * @apiError (ClientError) {json} 400 ErrUpdateUserField
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 * @apiDescription This will only update the database. In order to reflect
 * the changes in the user interface, a refresh or view update might be needed.
 * User needs to be authenticated to hit this endpoint.
 */
 userRouter.put('/', async (req: express.Request, res: express.Response) => {
    try {
        await userService.updateUser(req.body.userId, req.body);
        res.status(204).json({ message: messages.MESSAGE_204 });
    } catch (err) {
        if (err instanceof errors.ErrUpdateUserField) {
            res.status(400).json({ message: err.message });
            return;
        }
        console.log(err);
        res.status(500).json({ message: messages.MESSAGE_500 });
    }
});

export {
    injectSessionInfoMiddleWare,
    userRouter
};
