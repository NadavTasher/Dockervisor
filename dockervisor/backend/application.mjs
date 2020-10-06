/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Template/
 **/

// Import internal parts
import { Server } from "./internal/server/server.mjs";

// Create the server
let mServer = new Server(8000);

// Import dockervisor
import route from "./external/dockervisor.mjs";

// Enable the routes
mServer.insert("dockervisor", route);

// Listen for requests
mServer.listen();