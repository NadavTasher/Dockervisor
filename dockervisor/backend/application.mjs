/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Template/
 **/

// Import internal parts
import Server from "./internal/server/server.mjs";

// Create the server
let server = new Server(8000);

// Import dockervisor
import route from "./external/dockervisor.mjs";

// Enable the routes
server.insert("dockervisor", route);

// Listen for requests
server.listen();