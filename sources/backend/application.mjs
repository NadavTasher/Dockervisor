/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Template/
 **/

// Import internal parts
import Server from "./internal/server/server.mjs";

// Create the server
let server = new Server(8000);

// Import dockervisor
import Dockervisor from "./external/dockervisor.mjs";

// Initialize password parameter
let password = process.env.password;

// Make sure the password is defined
if (password === undefined) {
    // Set default password
    password = "Dockervisor2020";
    // Warn user for default password
    console.warn("No password in environment - Using default password!");
}

// Enable the routes
server.insert("dockervisor", Dockervisor.initialize(password));

// Listen for requests
server.listen();