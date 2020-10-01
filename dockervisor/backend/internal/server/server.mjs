/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Template/
 **/

// Import modules
import HTTP from "http";

// Import utilities
import Validator from "../utilities/validator.mjs";

/**
 * This class handles requests, parses them then passes them to the internal router.
 */
export default class Server {

    // Initialize private class members
    #port = null;
    #routes = null;

    /**
     * Creates a new server instance.
     * @param port Listening port
     */
    constructor(port = 8000) {
        // Set the port
        this.#port = port;
        // Create the routing table
        this.#routes = {};
    }

    // Public functions

    /**
     * Listens for requests.
     */
    listen() {
        // Start listening for incoming requests
        HTTP.createServer(this.#handle.bind(this)).listen(this.#port);
    }

    /**
     * Inserts a new route.
     * @param name Name
     * @param route Route
     */
    insert(name, route) {
        // Make sure the route does not exist already
        if (name in this.#routes)
            throw new Error(`Route "${name}" already exists`);

        // Insert the route to the routes object
        this.#routes[name] = route;
    }

    // Private functions

    /**
     * Passes requests for parsing and ensures a consistent output format.
     * @param request Incoming request
     * @param response Outgoing response
     * @return {Promise<void>}
     */
    async #handle(request, response) {
        // Create the initial output
        let output = {
            status: false,
            result: null
        };

        try {
            // Handle the request
            output.result = await this.#parse(request);
            output.status = true;
        } catch (error) {
            // Write the error to the output object
            output.result = error.message;
            output.status = false;
        }

        // Make sure a status is present
        if (output.status === undefined)
            output.status = false;

        // Make sure a result is present
        if (output.result === undefined)
            output.result = null;

        // Set output header
        response.setHeader("Content-Type", "application/json");
        // Write output
        response.write(JSON.stringify(output, null, 2));
        // End response
        response.end();
    }

    /**
     * Parses requests and passes them for routing.
     * @param request Incoming request
     * @return {Promise<*>} Result
     */
    async #parse(request) {
        // Split URL for query parameters
        let querySplit = request.url.split("?", 2);

        // Make sure the query split is not empty
        if (querySplit.length === 0)
            throw new Error(`Query parsing error`);

        // Parse route and action from path (first slice of query split)
        let pathSplit = querySplit.shift().split("/", 3).slice(1);

        // Make sure the length of the path split is exactly 2
        if (pathSplit.length !== 2)
            throw new Error(`Path parsing error`);

        // Shift path split and store route name
        let routeName = pathSplit.shift();

        // Make sure the route name is valid
        if (routeName === undefined || routeName.length === 0)
            throw new Error(`Missing route name`);

        // Shift path split and store action name
        let actionName = pathSplit.shift();

        // Make sure the action name is valid
        if (actionName === undefined || actionName.length === 0)
            throw new Error(`Missing action name`);

        // Create a temporary parameters object
        let parameters = {};

        // Check whether query parameters are available
        if (querySplit.length !== 0) {
            // Parse query string and append parameters
            let search = new URLSearchParams(querySplit.shift());

            // Append to parameters
            for (let key of search.keys()) {
                // Make sure the parameter was not provided already
                if (parameters.hasOwnProperty(key))
                    throw new Error(`Parameter "${key}" already provided`);

                // Set the parameter
                parameters[key] = search.get(key);
            }
        }

        // Check whether the request should also parse the post body and append query parameters
        if (request.method.toLowerCase() === "post") {
            // Read all of the post data
            let data = await new Promise((resolve) => {
                // Create a chunk buffer
                const chunks = [];
                // Wait for new data chunks
                request.on("data", async (chunk) => {
                    // Push the new chunk to the buffer
                    chunks.push(chunk);
                });
                // Handle the end of the data
                request.on("end", async () => {
                    // Concatenate the chunks buffer
                    const data = Buffer.concat(chunks).toString();
                    // Resolve the promise
                    resolve(data);
                });
            });

            // Parse post data as JSON
            let object = JSON.parse(data);

            // Make sure the object is of type object
            if (!Validator.valid(object, "object"))
                throw new Error(`Invalid request body type`);

            // Append to parameters
            for (let key in object) {
                // Make sure the parameter was not provided already
                if (parameters.hasOwnProperty(key))
                    throw new Error(`Parameter "${key}" already provided`);

                // Set the parameter
                parameters[key] = object[key];
            }
        }

        // Handle the request
        return await this.#route(routeName, actionName, parameters);
    }

    /**
     * Routes actions to the correct routes while validating parameters.
     * @param route Route (API)
     * @param action Action (Function)
     * @param parameters Parameters (Arguments)
     * @return {Promise<*>} Result
     */
    async #route(route, action, parameters) {
        // Make sure the routes adhere to the validation scheme
        if (!Validator.valid(this.#routes, {
            [route]: {
                [action]: {
                    handler: "function",
                    parameters: "object"
                }
            }
        })) throw new Error(`Requested route is invalid`);

        // Make sure the parameters object adheres to the parameters scheme
        Validator.validate(parameters, this.#routes[route][action].parameters);

        // Execute the handler
        return this.#routes[route][action].handler(parameters);
    }
}