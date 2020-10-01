/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Dockervisor/
 **/

// Import modules
import Path from "path";
import FileSystem from "fs";
import { execSync as Execute } from "child_process";

export default class Dockervisor {

    // Generate directory paths
    static #keyDirectory = null;
    static #deployDirectory = null;

    // Generate file paths
    static #privateKey = null;
    static #publicKey = null;

    static initialize(password) {
        // Generate the root directory path
        let root = "/dockervisor";

        // Make sure the root directory exists
        if (!FileSystem.existsSync(root))
            throw new Error("Root directory does not exist");

        // Generate sub-directory paths
        this.#keyDirectory = Path.join(root, "key");
        this.#deployDirectory = Path.join(root, "deploy");

        // Generate key file paths
        this.#privateKey = Path.join(this.#keyDirectory, "id");
        this.#publicKey = Path.join(this.#keyDirectory, "id.pub");

        // Make sure the sub-directories exist
        if (!FileSystem.existsSync(this.#keyDirectory))
            FileSystem.mkdirSync(this.#keyDirectory);

        if (!FileSystem.existsSync(this.#deployDirectory))
            FileSystem.mkdirSync(this.#deployDirectory);

        // Make sure the SSH key exists
        if (FileSystem.readdirSync(this.#keyDirectory).length === 0) {
            // Generate the creation command
            let command = `ssh-keygen -f "${this.#privateKey}" -t rsa -N "" -q`;

            // Execute the generation command
            Execute(command);
        }

        // Generate a password validator
        let validator = [
            // Has to be a string
            "string",
            // Has to be equal to the password
            (parameter) => parameter === password
        ];

        // Create and return routes
        return {
            // Password check endpoint
            checkPassword: {
                handler: (parameters) => { },
                parameters: {
                    password: validator
                }
            },
            // Deploy key read endpoint
            deployKey: {
                handler: (parameters) => {
                    // Make sure the public key exists
                    if (!FileSystem.existsSync(this.#publicKey))
                        throw new Error("Missing deploy key file");

                    // Read the key file
                    return FileSystem.readFileSync(this.#publicKey).toString();
                },
                parameters: {
                    password: validator
                }
            },
            // Setup endpoints
            checkSetup: {
                handler: (parameters) => {
                    // Check whether the deployment directory is empty
                    return FileSystem.readdirSync(this.#deployDirectory).length !== 0;
                },
                parameters: {
                    password: validator
                }
            },
            repositorySetup: {
                handler: (parameters) => {
                    // Make sure the deploy directory is empty
                    if (FileSystem.readdirSync(this.#deployDirectory).length !== 0)
                        throw new Error("Repository is already set-up");

                    // Clone the repository
                    return this.clone(parameters.repository.user, parameters.repository.name);
                },
                parameters: {
                    password: validator,
                    repository: {
                        user: [
                            // Has to be a valid key
                            "key"
                        ],
                        name: [
                            // Has to be a valid string
                            "string",
                            // Has to match specific charset
                            (parameter) => {
                                // Initialize the charset
                                const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.";

                                // Loop over all characters in the string
                                for (let char of parameter)
                                    // Return false if the charset does not contain the char
                                    if (!charset.includes(char))
                                        return false;

                                return true;
                            }
                        ]
                    }

                }
            },
            // General actions
            updateDeployment: {

            }
        };
    }

    static clone(user, name) {
        // Execute cloning command
        return Execute(`git clone git@github.com:${user}/${name}.git ${this.#deployDirectory}`).toString();
    }

    static pull() {
        // Execute pulling command
        return Execute(`git -C ${this.#deployDirectory} pull`).toString();
    }

}