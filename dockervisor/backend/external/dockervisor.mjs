/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Dockervisor/
 **/

// Import modules
import Path from "path";
import FileSystem from "fs";
import { execSync } from "child_process";

// Create a utility function for executing commands
const execute = (command) => execSync(command).toString();

// Create the password variable
const password = process.env.PASSWORD || "Dockervisor";

// Create the repository variable
const repository = process.env.REPOSITORY || "NadavTasher/Dockervisor";

// Create the root directory path
const root = "/dockervisor";

// Make sure the root directory exists
if (!FileSystem.existsSync(root))
    throw new Error("Root directory does not exist");

// Generate sub-directory paths
const keyDirectory = Path.join(root, "key");
const deployDirectory = Path.join(root, "deploy");

// Generate key file paths
const privateKey = Path.join(keyDirectory, "id");
const publicKey = Path.join(keyDirectory, "id.pub");

// Make sure the sub-directories exist
if (!FileSystem.existsSync(keyDirectory))
    FileSystem.mkdirSync(keyDirectory);

if (!FileSystem.existsSync(deployDirectory))
    FileSystem.mkdirSync(deployDirectory);

// Make sure the SSH key exists
if (FileSystem.readdirSync(keyDirectory).length === 0) {
    // Generate a new SSH key
    execute(`ssh-keygen -f "${privateKey}" -t rsa -N "" -q`);
}

// Generate a password validator
const validators = {
    password: [
        // Has to be a string
        "string",
        // Has to be equal to the password
        (parameter) => parameter === password
    ]
};

export default {
    // Password check endpoint
    checkPassword: {
        handler: () => { },
        parameters: validators
    },
    // Deploy key read endpoint
    deployKey: {
        handler: () => {
            // Make sure the public key exists
            if (!FileSystem.existsSync(publicKey))
                throw new Error("Missing deploy key file");

            // Read the key file
            return FileSystem.readFileSync(publicKey).toString();
        },
        parameters: validators
    },
    // Deployment management endpoints
    checkDeployment: {
        handler: () => {
            // Check whether the deployment directory is empty
            return FileSystem.readdirSync(deployDirectory).length !== 0;
        },
        parameters: validators
    },
    cloneDeployment: {
        handler: () => {
            // Make sure the deploy directory is empty
            if (FileSystem.readdirSync(deployDirectory).length !== 0)
                throw new Error("Deployment is already set-up");

            // Clone the repository
            return execute(`cd ${deployDirectory}; git clone git@github.com:${repository}.git .`);
        },
        parameters: validators
    },
    pullDeployment: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deployDirectory).length === 0)
                throw new Error("Deployment is not set-up");

            // Clone the repository
            return execute(`cd ${deployDirectory}; git pull`);
        },
        parameters: validators
    },
    // Compose actions
    startDeployment: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deployDirectory).length === 0)
                throw new Error("Deployment is not set-up");

            // Clone the repository
            return execute(`cd ${deployDirectory}; docker-compose up --build --detach`);
        },
        parameters: validators
    },
    stopDeployment: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deployDirectory).length === 0)
                throw new Error("Deployment is not set-up");

            // Clone the repository
            return execute(`cd ${deployDirectory}; docker-compose down --timeout 10`);
        },
        parameters: validators
    },
    destroyDeployment: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deployDirectory).length === 0)
                throw new Error("Deployment is not set-up");

            // Clone the repository
            return execute(`cd ${deployDirectory}; docker-compose down --volumes --timeout 5`);
        },
        parameters: validators
    },
    statusDeployment: {
        handler: () => {
            // Generate the status object
            let status = {
                log: "No logs",
                state: "Unknown"
            };

            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deployDirectory).length !== 0) {
                // Read logs
                status.log = execute(`cd ${deployDirectory}; docker-compose logs --no-color`);

                // Check whether containers are running
                status.state = execute(`cd ${deployDirectory}; docker-compose ps --quiet`).length === 0 ? "Stopped" : "Running";
            }

            return status;
        },
        parameters: validators
    }
};