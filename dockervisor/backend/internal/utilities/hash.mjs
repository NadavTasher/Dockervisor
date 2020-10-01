/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Template/
 **/

// Import modules
import Crypto from "crypto";

/**
 * This class contains hashing utility functions.
 */
export default class Hash {
    
    /**
     * Hashes a given message.
     * @param message Message
     * @param output Output encoding
     * @return {string} Hash
     */
    static hash(message, output = "hex") {
        return Crypto.createHash("sha256").update(message).digest(output);
    }

    /**
     * HMACs a given message.
     * @param message Message
     * @param password Password (Secret)
     * @param output Output encoding
     * @return {string} HMAC
     */
    static hmac(message, password, output = "hex") {
        return Crypto.createHmac("sha256", password).update(message).digest(output);
    }
}