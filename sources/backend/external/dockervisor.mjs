/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Dockervisor/
 **/

// Read the password from environment
let Password = process.env.password;

// Make sure the password is defined
if (Password === undefined) {
    // Set default password
    Password = "Dockervisor2020";

    // Write warning to log
    console.warn("No password in environment - Using default password!");
}

export default {
    isSetup: {
        handler: (parameters) => {

        },
        parameters: {}
    },
    doSetup: {
        handler: (parameters) => {

        },
        parameters: {
            repository: "string",
            authorization: {
                ssh: "string"
            }
        }
    },
    echo: {
        handler: (parameters) => {
            return parameters.contents;
        },
        parameters: {
            contents: "string"
        }
    }
};