/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Template/
 **/

/**
 * This class contains general utility functions.
 */
export default class Utilities {

    /**
     * Generates random strings.
     * @param length Length
     * @param charset Charset
     * @return {string} Random string
     */
    static random(length = 0, charset = "abcdefghijklmnopqrstuvwxyz0123456789") {
        // Make sure the requested length is longer then 0
        if (length === 0)
            return "";

        // Return a random charset character and recurse
        return charset[Math.floor(Math.random() * charset.length)] + this.random(length - 1, charset);
    }
}


