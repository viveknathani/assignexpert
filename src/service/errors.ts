export class ErrInvalidEmailFormat extends Error {

    constructor() {

        super('Invalid email format. Check RFC 5322.');
        Object.setPrototypeOf(this,ErrInvalidEmailFormat.prototype);
    }
}

export class ErrInvalidPasswordFormat extends Error {

    constructor() {

        super('Password format: Min. 8 chars, atleast 1 number' +
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
        Object.setPrototypeOf(this,ErrUpdateUserField.prototype);
    }
}
