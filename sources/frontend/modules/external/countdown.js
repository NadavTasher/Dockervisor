/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Template/
 **/

class Countdown {
    /**
     * Start a countdown.
     * @param view View
     * @param date Date
     * @return Promise
     */
    static start(view, date) {
        // Create a promise
        return new Promise(async (resolve, reject) => {
            // Await module import
            await Module.import("UI");

            // Initialize the interval variable
            let interval;

            // Initialize the units array
            const units = [
                1000 * 60 * 60 * 24, // One day
                1000 * 60 * 60, // One hour
                1000 * 60, // One minute
                1000 // One second
            ];

            // Create a function that calculates the time delta
            let calculate = (date) => {
                return date - Date.now();
            };

            // Create a function that converts arrays to time strings
            let stringify = (delta) => {
                // Initialize the parts array
                let parts = [];

                // Loop over units
                for (let unit of units) {
                    // Calculate the current unit value
                    let value = Math.floor(delta / unit);

                    // Parse the delta
                    parts.push((value < 10 ? "0" : "") + value);

                    // Update the delta
                    delta %= unit;
                }

                // Join parts
                return parts.join(":");
            };

            // Create a function that updates the view with new text
            let update = () => {
                // Calculate the delta
                let delta = calculate(date);

                // Make sure the countdown is still running
                if (delta > 0) {
                    // Countdown update
                    UI.write(view, stringify(delta));
                } else {
                    // Clear the interval
                    clearInterval(interval);

                    // Resolve
                    resolve("Countdown finished");
                }
            };

            // Check whether an interval is needed
            if (calculate(date) > 0) {
                // Initial countdown update
                update();

                // Start the interval
                interval = setInterval(update, 1000);
            } else {
                // Reject with error
                reject("Date already passed");
            }
        });
    }
}