/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Template/
 **/

// Import utilities
import Hash from "./hash.mjs";

const DELIMITER = ":";

const CONTENT_KEY = "content";
const CONTENT_DEFAULT = null;

const VALIDITY_KEY = "validity";
const VALIDITY_DEFAULT = (60 * 60 * 24 * 365) * 1000;

/**
 * A simple interface for issuing and validating tokens.
 */
export default class Token {

    // Initialize private class members
    #password = null;

    /**
     * Creates a new token instance.
     * @param password Password
     */
    constructor(password) {
        // Set the password
        this.#password = password;
    }

    /**
     * Issues a token.
     * @param content Contents
     * @param validity Validity
     * @return {string} Token
     */
    issue(content = CONTENT_DEFAULT, validity = VALIDITY_DEFAULT) {
        // Create the token object
        let tokenObject = {
            [CONTENT_KEY]: content,
            [VALIDITY_KEY]: new Date().getTime() + validity
        };

        // Encode the token object as JSON then as a Base64 string
        let tokenString = Buffer.from(JSON.stringify(tokenObject)).toString("base64");

        // Create an HMAC for the token then encode it as a Base64 string
        let tokenHMAC = Hash.hmac(tokenString, this.#password, "base64");

        // Create an array with the parts of the token
        let tokenSlices = [tokenString, tokenHMAC];

        // Compile the parts into a single string and return it
        return tokenSlices.join(DELIMITER);
    }

    /**
     * Validates a token.
     * @param token Token
     * @return {*} Content
     */
    validate(token) {
        // Decompile the token into an array
        let tokenSlices = token.split(DELIMITER);

        // Make sure there are exactly 2 parts
        if (tokenSlices.length !== 2)
            throw new Error(`Invalid token structure`);

        let tokenString = tokenSlices.shift();
        let tokenHMAC = tokenSlices.shift();

        // Make sure the signature is valid
        if (Hash.hmac(tokenString, this.#password, "base64") !== tokenHMAC)
            throw new Error(`Invalid token signature`);

        // Parse the token string as Base64 then as JSON
        let tokenObject = JSON.parse(Buffer.from(tokenString, "base64").toString());

        // Make sure the token is still valid
        if (new Date().getTime() > tokenObject[VALIDITY_KEY])
            throw new Error(`Invalid token validity`);

        // Return the content
        return tokenObject[CONTENT_KEY];
    }
}
