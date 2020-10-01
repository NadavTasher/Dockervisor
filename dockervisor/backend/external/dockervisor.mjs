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
    access: {
        handler: () => { },
        parameters: validators
    },
    // Deployment key endpoint
    deploymentKey: {
        handler: () => {
            // Make sure the file exists
            if (!FileSystem.existsSync(publicKey))
                throw new Error("Deployment key file missing");

            // Read the key file
            return FileSystem.readFileSync(publicKey).toString();
        },
        parameters: validators
    },
    // Deployment log endpoint
    deploymentLog: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deployDirectory).length === 0)
                throw new Error("Deployment is not set-up");

            // Execute a docker-compose log command with no colors in the output
            return execute(`cd ${deployDirectory}; docker-compose logs --no-color`);
        },
        parameters: validators
    },
    // Deployment status endpoint
    deploymentStatus: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deployDirectory).length === 0)
                throw new Error("Deployment is not set-up");

            // Execute a docker-compose ps command with only the container IDs as outputs
            return execute(`cd ${deployDirectory}; docker-compose ps --quiet`).length === 0 ? "Stopped" : "Running";
        },
        parameters: validators
    },
    // Deployment setup and update endpoints
    setupDeployment: {
        handler: () => {
            // Make sure the deploy directory is empty
            if (FileSystem.readdirSync(deployDirectory).length !== 0)
                throw new Error("Deployment is already set-up");

            // Execute a git clone command to clone the repository
            return execute(`cd ${deployDirectory}; git clone git@github.com:${repository}.git .`);
        },
        parameters: validators
    },
    updateDeployment: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deployDirectory).length === 0)
                throw new Error("Deployment is not set-up");

            // Execute a git pull command to update the repository
            return execute(`cd ${deployDirectory}; git pull`);
        },
        parameters: validators
    },
    // Deployment state changing endpoints
    startDeployment: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deployDirectory).length === 0)
                throw new Error("Deployment is not set-up");

            // Execute a docker-compose up (start) command to start the services
            return execute(`cd ${deployDirectory}; docker-compose up --build --detach`);
        },
        parameters: validators
    },
    stopDeployment: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deployDirectory).length === 0)
                throw new Error("Deployment is not set-up");

            // Execute a docker-compose down (stop) command to stop the services
            return execute(`cd ${deployDirectory}; docker-compose down --timeout 10`);
        },
        parameters: validators
    },
    destroyDeployment: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deployDirectory).length === 0)
                throw new Error("Deployment is not set-up");

            // Execute a docker-compose down (stop) command with the volumes parameter to destroy the volumes and the services
            return execute(`cd ${deployDirectory}; docker-compose down --volumes --timeout 5`);
        },
        parameters: validators
    }
};