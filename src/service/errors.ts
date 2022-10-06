export class ErrInvalidEmailFormat extends Error {

    constructor() {

        super('Invalid email format. Check RFC 5322.');
        Object.setPrototypeOf(this,ErrInvalidEmailFormat.prototype);
    }
}

export class ErrInvalidPasswordFormat extends Error {

    constructor() {

        super('Password format: Min. 8 chars, atleast 1 number, ' +
		'1 lowercase char, 1 uppercase char, 1 special char');
        Object.setPrototypeOf(this,ErrInvalidPasswordFormat.prototype);
    }
}

export class ErrEmailExists extends Error {

    constructor() {
        
        super('This email already exists.');
        Object.setPrototypeOf(this,ErrEmailExists.prototype);
    }
}

export class ErrInvalidEmailPassword extends Error {

    constructor() {

        super('Invalid email/password combination.');
        Object.setPrototypeOf(this,ErrInvalidEmailPassword.prototype);
    }
}

export class ErrUpdateUserField extends Error {

    constructor() {

        super('Could not update field.');
        Object.setPrototypeOf(this,ErrUpdateUserField.prototype);
    }
}

export class ErrUnsupportedLanguage extends Error {

    constructor() {

        super('Unsupported language.');
        Object.setPrototypeOf(this,ErrUnsupportedLanguage.prototype);
    }
}

export class ErrJobMkdir extends Error {

    constructor() {

        super('Failed in making files and directories for the job.');
        Object.setPrototypeOf(this,ErrJobMkdir.prototype);
    }
}

export class ErrNoContainerCreate extends Error {

    constructor() {

        super('Failed in making a container for the job.');
        Object.setPrototypeOf(this,ErrNoContainerCreate.prototype);
    }
}

export class ErrNoContainerRun extends Error {

    constructor() {

        super('Failed in running a container.');
        Object.setPrototypeOf(this,ErrNoContainerRun.prototype);
    }
}

export class ErrCodeCompileError extends Error {

    constructor() {

        super('Compile error.');
        Object.setPrototypeOf(this,ErrCodeCompileError.prototype);
    }
}

export class ErrRuntimeError extends Error {

    constructor() {

        super('Runtime error.');
        Object.setPrototypeOf(this,ErrRuntimeError.prototype);
    }
}

export class ErrTimeLimitExceeded extends Error {

    constructor() {

        super('TLE.');
        Object.setPrototypeOf(this,ErrRuntimeError.prototype);
    }
}

export class ErrInvalidStudentOperation extends Error {
    constructor() {

        super('Unauthorized access for students.');
        Object.setPrototypeOf(this,ErrInvalidStudentOperation.prototype);
    }
}

export class ErrInvalidFacultyOperation extends Error {
    constructor() {

        super('Unauthorized access for faculties.');
        Object.setPrototypeOf(this,ErrInvalidFacultyOperation.prototype);
    }
}

export class ErrCodeExists extends Error {

    constructor() {
        
        super('This class code already exists.');
        Object.setPrototypeOf(this,ErrCodeExists.prototype);
    }
}

export class ErrClassNotFound extends Error {

    constructor() {
        
        super('Class not found.');
        Object.setPrototypeOf(this,ErrClassNotFound.prototype);
    }
}

export class ErrAssignmentNotFound extends Error {

    constructor() {
        
        super('Assignment not found.');
        Object.setPrototypeOf(this,ErrAssignmentNotFound.prototype);
    }
}

export class ErrSubmissionNotFound extends Error {

    constructor() {
        
        super('Submission not found.');
        Object.setPrototypeOf(this,ErrSubmissionNotFound.prototype);
    }
}

export class ErrAssignmentAlreadyCompleted extends Error {

    constructor() {
        
        super('Assignment already has a submission marked complete.');
        Object.setPrototypeOf(this,ErrAssignmentAlreadyCompleted.prototype);
    }
}

export class ErrInvalidJobId extends Error {

    constructor() {

        super('Job id needs to have the prefix: job-');
        Object.setPrototypeOf(this, ErrInvalidJobId.prototype);
    }
}

export class ErrNonPositivePointsForTestcase extends Error {

    constructor() {
        
        super('Points for a testcase should not be negative or zero.');
        Object.setPrototypeOf(this,ErrNonPositivePointsForTestcase.prototype);
    }
}

export class ErrTotalPointsNotEqualAssignmentPoints extends Error {

    constructor() {
        
        super('Total points of all testcases not equal to assignment points.');
        Object.setPrototypeOf(this,ErrTotalPointsNotEqualAssignmentPoints.prototype);
    }
}

export class ErrLateSubmissionNotAllowed extends Error {

    constructor() {
        
        super('The deadline for the assignment has already passed.');
        Object.setPrototypeOf(this,ErrLateSubmissionNotAllowed.prototype);
    }
}

export class ErrTemplateNoId extends Error {

    constructor() {
        
        super('Need template id for updating.');
        Object.setPrototypeOf(this,ErrTemplateNoId.prototype);
    }
}