/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Dockervisor/
 **/

// Import modules
import FileSystem from "fs";
import { execSync } from "child_process";

// Create a utility function for executing commands
const execute = (command) => execSync(command).toString();

// Create the password variable
const password = process.env.PASSWORD || "Dockervisor";

// Create the repository variable
const repository = process.env.REPOSITORY || "NadavTasher/Dockervisor";

// Create the paths
const root = "/dockervisor";

const key = "/dockervisor/key";
const deploy = "/dockervisor/deploy";

const secret = "/dockervisor/key/id";
const global = "/dockervisor/key/id.pub";

// Make sure the root directory exists
if (!FileSystem.existsSync(root))
    throw new Error("Root directory does not exist");

// Generate sub-directory paths


// Generate key file paths


// Make sure the sub-directories exist
if (!FileSystem.existsSync(key))
    FileSystem.mkdirSync(key);

if (!FileSystem.existsSync(deploy))
    FileSystem.mkdirSync(deploy);

// Make sure the SSH key exists
if (!FileSystem.existsSync(secret))
    execute(`ssh-keygen -f "${secret}" -t rsa -N "" -q`);

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
            if (!FileSystem.existsSync(global))
                throw new Error("Deployment key file missing");

            // Read the key file
            return FileSystem.readFileSync(global).toString();
        },
        parameters: validators
    },
    // Deployment log endpoint
    deploymentLog: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deploy).length === 0)
                throw new Error("Deployment is not set-up");

            // Execute a docker-compose log command with no colors in the output
            return execute(`cd ${deploy}; docker-compose logs --no-color`);
        },
        parameters: validators
    },
    // Deployment status endpoint
    deploymentStatus: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deploy).length === 0)
                throw new Error("Deployment is not set-up");

            // Execute a docker-compose ps command with only the container IDs as outputs
            return execute(`cd ${deploy}; docker-compose ps --quiet`).length === 0 ? "Stopped" : "Running";
        },
        parameters: validators
    },
    // Deployment exists endpoint
    deploymentExists: {
        handler: () => {
            // Check whether deployment exists
            return FileSystem.readdirSync(deploy).length !== 0;
        },
        parameters: validators
    },
    // Deployment setup and update endpoints
    setupDeployment: {
        handler: () => {
            // Make sure the deploy directory is empty
            if (FileSystem.readdirSync(deploy).length !== 0)
                throw new Error("Deployment is already set-up");

            // Execute a git clone command to clone the repository
            return execute(`cd ${deploy}; git clone git@github.com:${repository}.git .`);
        },
        parameters: validators
    },
    updateDeployment: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deploy).length === 0)
                throw new Error("Deployment is not set-up");

            // Execute a git pull command to update the repository
            return execute(`cd ${deploy}; git pull`);
        },
        parameters: validators
    },
    // Deployment state changing endpoints
    startDeployment: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deploy).length === 0)
                throw new Error("Deployment is not set-up");

            // Execute a docker-compose up (start) command to start the services
            return execute(`cd ${deploy}; docker-compose up --build --detach`);
        },
        parameters: validators
    },
    stopDeployment: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deploy).length === 0)
                throw new Error("Deployment is not set-up");

            // Execute a docker-compose down (stop) command to stop the services
            return execute(`cd ${deploy}; docker-compose down --timeout 2`);
        },
        parameters: validators
    },
    destroyDeployment: {
        handler: () => {
            // Make sure the deploy directory is not empty
            if (FileSystem.readdirSync(deploy).length === 0)
                throw new Error("Deployment is not set-up");

            // Execute a docker-compose down (stop) command with the volumes parameter to destroy the volumes and the services
            return execute(`cd ${deploy}; docker-compose down --volumes --remove-orphans --timeout 2`);
        },
        parameters: validators
    }
};