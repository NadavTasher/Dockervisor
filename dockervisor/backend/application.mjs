/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Template/
 **/

// Import internal parts
import { Server } from "./internal/server.mjs";

// Create the server
let mServer = new Server(8000);

// Import dockervisor
import Routes from "./external/dockervisor.mjs";

// Enable the routes
mServer.insertAll(Routes);

// Listen for requests
mServer.listen();