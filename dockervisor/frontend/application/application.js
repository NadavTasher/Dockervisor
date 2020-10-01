window.addEventListener("load", async function () {
    // Import modules
    await Module.import("UI", "API");

    // Initialize the application
    Dockervisor.initialize();
});

class Dockervisor {

    /**
     * API call proxy.
     * @param {string} action Action
     * @param {object} parameters Parameters
     */
    static call(action) {
        return API.call("dockervisor", action, {
            password: localStorage.password
        });
    }

    /**
     * Initializes the application.
     */
    static initialize() {
        // Check the password
        Dockervisor.call("access").then(
            () => {
                // Check deployment setup
                Dockervisor.call("deploymentExists").then(
                    (exists) => {
                        if (exists) {
                            // Refresh dashboard
                            Dockervisor.dashboard();
                        } else {
                            // Show loading overlay
                            Dockervisor.showLoading("Preparing setup...");

                            // Request deploy key
                            API.call("dockervisor", "deploymentKey", {
                                password: localStorage.password
                            }).then(
                                (deployKey) => {
                                    // Write deploy key to copyable UI element
                                    UI.write("key", deployKey);

                                    // Change application page
                                    UI.view("setup");

                                    // Hide loading overlay
                                    Dockervisor.hideLoading();
                                }
                            ).catch(alert);
                        }
                    }
                ).catch(alert);
            }
        ).catch(
            () => {
                // Change application page
                UI.view("access");
                
                // Hide loading overlay
                Dockervisor.hideLoading();
            }
        );
    }

    /**
     * Updates the dashboard.
     */
    static dashboard() {
        // Show the loading overlay
        Dockervisor.showLoading("Loading dashboard...");

        // Request deployment status
        Dockervisor.call("deploymentStatus").then(
            (status) => {
                // Write status to UI
                UI.write("status", status);

                // Hide loading overlay
                Dockervisor.hideLoading();
            }
        ).catch(
            () => {
                // Write error to output
                UI.write("output", "Error");
            }
        );

        // Request deployment log
        Dockervisor.call("deploymentLog").then(
            (log) => {
                // Write log to output
                UI.write("output", log);

                // Hide loading overlay
                Dockervisor.hideLoading();
            }
        ).catch(
            () => {
                // Write error to log
                UI.write("output", "Unable to read log");
            }
        );

        // Change application page
        UI.view("dashboard");
    }

    /**
     * Executes a deployment action.
     * @param {string} action Action
     * @param {string} text Loading text
     */
    static button(action, text) {
        // Show loading overlay
        Dockervisor.showLoading(text);

        // Switch between actions
        Dockervisor.call(`${action}Deployment`).then(
            () => {
                // Refresh dashboard
                Dockervisor.dashboard();
            }
        ).catch(
            (error) => {
                // Hide loading overlay
                Dockervisor.hideLoading();

                // Show error message
                alert(error);
            }
        );
    }

    /**
     * Show the loading overlay.
     * @param {string} explaination Explaination
     */
    static showLoading(explaination = "Loading...") {
        // Show loading overlay
        UI.show("loading");

        // Write explaination to UI
        UI.write("explaination", explaination);
    }

    /**
     * Hide the loading overlay.
     */
    static hideLoading() {
        // Hide loading overlay
        UI.hide("loading");
    }

}