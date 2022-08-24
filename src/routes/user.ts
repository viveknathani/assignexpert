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
                res.status(400).json({ message: 'you need to authenticate' });
                return;
            }
            req.body.userId = sessionInfo.userId;
            req.body.isStudent = sessionInfo.isStudent;
            next();
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: messages.MESSAGE_500 });
        }
};

/**
 * @api {post} /api/user/signup Signup
 * @apiGroup User
 * @apiName Signup
 * @apiBody {boolean} isStudent Mandatory
 * @apiBody {string} firstName Mandatory 
 * @apiBody {string} lastName  Mandatory 
 * @apiBody {string} email     Mandatory 
 * @apiBody {string} password  Mandatory (format: Min. 8 chars, atleast 1 number, 1 lowercase character, 1 uppercase character, 1 special character)
 * @apiBody {number} rollNumber|employeeNumber Mandatory
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
            wantsEmailNotifications: response.wantsEmailNotifications
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
 * @api {put} /api/user/firstName Update first name
 * @apiGroup User
 * @apiName Update first name
 * @apiBody {string} email      Mandatory 
 * @apiBody {string} firstName  Mandatory, the new first name 
 * @apiError (ClientError) {json} 400 ErrUpdateUserField
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 * @apiDescription This will only update the database. In order to reflect
 * the changes in the user interface, a refresh or view update might be needed.
 * User needs to be authenticated to hit this endpoint.
 */
userRouter.put('/firstName', async (req: express.Request, res: express.Response) => {
    try {
        const { email, firstName } = req.body;
        await userService.updateFirstName(email, firstName);
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

/**
 * @api {put} /api/user/lastName Update last name
 * @apiGroup User
 * @apiName Update last name
 * @apiBody {string} email      Mandatory 
 * @apiBody {string} lastName  Mandatory, the new last name
 * @apiError (ClientError) {json} 400 ErrUpdateUserField 
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 * @apiDescription This will only update the database. In order to reflect
 * the changes in the user interface, a refresh or view update might be needed.
 * User needs to be authenticated to hit this endpoint.
 */
userRouter.put('/lastName', async (req: express.Request, res: express.Response) => {
    try {
        const { email, lastName } = req.body;
        await userService.updateLastName(email, lastName);
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

/**
 * @api {put} /api/user/password Update password
 * @apiGroup User
 * @apiName Update password
 * @apiBody {string} email        Mandatory 
 * @apiBody {string} oldPassword  Mandatory, the password you have
 * @apiBody {string} newPassword  Mandatory, the password you want
 * @apiError (ClientError) {json} 400 ErrUpdateUserField
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 * @apiDescription User needs to be authenticated to hit this endpoint.
 */
userRouter.put('/password', async (req: express.Request, res: express.Response) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        await userService.updatePassword(email, oldPassword, newPassword);
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

/**
 * @api {put} /api/user/preferences Update preferences
 * @apiGroup User
 * @apiName Update preferences
 * @apiBody {string} email        Mandatory 
 * @apiBody {string} uiTheme      Mandatory
 * @apiBody {string} editorTheme  Mandatory
 * @apiBody {boolean} wantsEmailNotifications  Mandatory
 * @apiError (ClientError) {json} 400 ErrUpdateUserField
 * @apiError (ServerError) {json} 500 Need to check server logs
 * @apiVersion 0.1.0
 * @apiDescription User needs to be authenticated to hit this endpoint.
 */
userRouter.put('/preferences', async (req: express.Request, res: express.Response) => {
    try {
        const { email } = req.body;
        await userService.updatePreferences(email, req.body);
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