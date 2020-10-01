/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Template/
 **/

class API {
    /**
     * Sends an API call.
     * @param route Route (API)
     * @param action Action (Function)
     * @param parameters Parameters
     * @return Promise
     */
    static call(route = null, action = null, parameters = null) {
        return new Promise((resolve, reject) => {
            // Perform the request
            fetch(`api/${route}/${action}`, {
                method: "post",
                body: JSON.stringify(parameters)
            }).then((response) => {
                response.json().then((result) => {
                    // Check the result's integrity
                    if (result.hasOwnProperty("status") && result.hasOwnProperty("result")) {
                        // Call the callback with the result
                        if (result["status"] === true) {
                            resolve(result["result"]);
                        } else {
                            reject(result["result"]);
                        }
                    } else {
                        // Reject with an error
                        reject("API response malformed");
                    }
                }).catch((reason) => {
                    // Reject with an error
                    reject("API response malformed");
                });
            });
        });
    }
}