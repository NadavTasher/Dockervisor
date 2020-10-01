/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Template/
 **/

// Utility functions
const Utilities = {
    match(string, charset = "abcdefghijklmnopqrstuvwxyz0123456789") {
        // Loop over all characters in the string
        for (let char of string)
            // Return false if the charset does not contain the char
            if (!charset.includes(char))
                return false;

        return true;
    }
};

// Common validators
const Validators = {

    // General type validators

    nonnull(variable) {
        // Make sure the variable is not null
        return variable !== null;
    },
    string(variable) {
        // Make sure the variable is not null
        if (!Validators.nonnull(variable))
            return false;

        // Make sure the type is string
        return typeof variable === "string";
    },
    number(variable) {
        // Make sure the variable is not null
        if (!Validators.nonnull(variable))
            return false;

        // Make sure the type is number
        return typeof variable === "number";
    },
    boolean(variable) {
        // Make sure the variable is not null
        if (!Validators.nonnull(variable))
            return false;

        // Make sure the type is boolean
        return typeof variable === "boolean";
    },
    array(variable) {
        // Make sure the variable is not null
        if (!Validators.nonnull(variable))
            return false;

        // Make sure the variable is an array
        return Array.isArray(variable);
    },
    object(variable) {
        // Make sure the variable is not null
        if (!Validators.nonnull(variable))
            return false;

        // Make sure the variable is not an array
        if (Validators.array(variable))
            return false;

        return typeof variable === "object";
    },
    function(variable) {
        // Make sure the variable is not null
        if (!Validators.nonnull(variable))
            return false;

        // Make sure the variable type is function
        return typeof variable === "function";
    },

    // String encoding validators

    binary(variable) {
        // Make sure the variable is not null
        if (!Validators.nonnull(variable))
            return false;

        // Make sure the variable is a string
        if (!Validators.string(variable))
            return false;

        // Make sure the variable matches the charset
        return Utilities.match(variable, "01");
    },
    decimal(variable) {
        // Make sure the variable is not null
        if (!Validators.nonnull(variable))
            return false;

        // Make sure the variable is a string
        if (!Validators.string(variable))
            return false;

        // Make sure the variable matches the charset
        return Utilities.match(variable, "0123456789");
    },
    hexadecimal(variable) {
        // Make sure the variable is not null
        if (!Validators.nonnull(variable))
            return false;

        // Make sure the variable is a string
        if (!Validators.string(variable))
            return false;

        // Make sure the variable matches the charset
        return Utilities.match(variable, "0123456789abcdef");
    },

    // Complex variable validators

    id(variable) {
        // Make sure the variable is not null
        if (!Validators.nonnull(variable))
            return false;

        // Make sure the variable is a string
        if (!Validators.string(variable))
            return false;

        // Make sure the variable matches the charset
        return Utilities.match(variable, "abcdefghijklmnopqrstuvwxyz0123456789");
    },
    key(variable) {
        // Make sure the variable is not null
        if (!Validators.nonnull(variable))
            return false;

        // Make sure the variable is a string
        if (!Validators.string(variable))
            return false;

        // Make sure the variable matches the charset
        return Utilities.match(variable, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
    },
    hash(variable) {
        // Make sure the variable is not null
        if (!Validators.nonnull(variable))
            return false;

        // Make sure the variable is a string
        if (!Validators.string(variable))
            return false;

        // Make sure the variable is hexadecimal
        if (!Validators.hexadecimal(variable))
            return false;

        // Make sure the length of the variable is valid
        return variable.length === 64;
    }
};

/**
* This class contains variable validation utility functions.
*/
export default class Validator {

    /**
     * Checks whether a variable is valid using a validator function, scheme or validator name.
     * @param variable Variable
     * @param validator Validator
     * @return {boolean} Is valid
     */
    static valid(variable, validator = "nonnull") {
        // Wrap execution with try/catch
        try {
            // Validate using the validation function
            this.validate(variable, validator);

            // Validation passed - return true
            return true;
        } catch {
            // Validation failed - return false
            return false;
        }
    }

    /**
     * Validates a variable using a validator function, scheme or validator name.
     * @param variable Variable
     * @param validator Validator
     * @throws {Error} Validation error
     */
    static validate(variable, validator = "nonnull") {

        // Check whether the validator is a function
        if (Validators.function(validator)) {
            // Execute the validator
            if (validator(variable) === false)
                throw new Error(`Variable is invalid`);
        }

        // Check whether the validator is a string
        if (Validators.string(validator)) {
            // Make sure the validator exists
            if (!Validators.hasOwnProperty(validator))
                throw new Error(`Missing "${validator}" validator`);

            // Validate using the validator
            this.validate(variable, Validators[validator]);
        }

        // Check whether the validator is an array
        if (Validators.array(validator)) {
            // Loop over validator and individually validate with each item
            for (let item of validator)
                this.validate(variable, item);
        }

        // Check whether the validator is an object (scheme)
        if (Validators.object(validator)) {
            // Make sure the variable is an object
            if (!Validators.object(variable))
                throw new Error(`Variable is not an object`);

            // Loop over each of the validator's properties and validate them
            for (let property in validator) {
                // Make sure the property is a valid key
                if (!Validators.key(property))
                    throw new Error(`Key "${property}" is invalid`);

                // Make sure the property exists in the variable
                if (!variable.hasOwnProperty(property))
                    throw new Error(`Missing "${property}" property`);

                // Validate recursively
                this.validate(variable[property], validator[property]);
            }
        }
    }
}