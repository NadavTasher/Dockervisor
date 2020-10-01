window.addEventListener("load", async function () {
    // Import modules
    await Module.import("UI", "API");

    // Initialize the application
    Dockervisor.initialize();
});

class Dockervisor {

    static showLoading(text = "Loading...") {
        UI.show("loading");
        UI.write("loading-text", text);
    }

    static hideLoading() {
        UI.hide("loading");
    }

    static initialize() {
        // Show the loading overlay
        this.showLoading("Loading application...");

        // Check whether a password has been saved
        this.checkPassword(localStorage.password || null);
    }

    static dashboard() {
        // Show the loading overlay
        this.showLoading("Loading dashboard...");

        // Check deployment status
        API.call("dockervisor", "statusDeployment", {
            password: localStorage.password
        }).then(
            (status) => {
                // Change view
                UI.view("dashboard");

                // Hide loading overlay
                this.hideLoading();
            }
        ).catch((reason) => {
            // Hide loading overlay
            this.hideLoading();

            // Alert the user
            alert(reason);
        });
    }

    static checkPassword(password = UI.read("password-input")) {
        // Show loading overlay
        this.showLoading("Checking password...");

        // Check whether the password is correct
        API.call("dockervisor", "checkPassword", {
            password: password
        }).then(() => {
            // Save password to localStorage
            localStorage.password = password;

            // Load next stage
            this.checkSetup();
        }).catch(() => {
            // Change the view
            UI.view("password");

            // Empty the input
            UI.write("password-input", String());

            // Hide loading overlay
            this.hideLoading();
        });
    }

    static checkSetup() {
        // Show loading overlay
        this.showLoading("Checking repository...");

        // Check whether the repository is set-up
        API.call("dockervisor", "checkSetup", {
            password: localStorage.password
        }).then((setup) => {
            if (setup) {
                // Load next stage
                this.dashboard();
            } else {
                // Show loading overlay
                this.showLoading("Preparing setup...");

                // Load SSH key
                API.call("dockervisor", "deployKey", {
                    password: localStorage.password
                }).then(
                    (key) => {
                        // Write key to UI
                        UI.write("setup-key", key);

                        // Change view
                        UI.view("setup");

                        // Hide loading overlay
                        this.hideLoading();
                    }
                ).catch(alert);
            }
        }).catch((reason) => {
            // Hide loading overlay
            this.hideLoading();

            // Alert the user
            alert(reason);
        });
    }

    static repositorySetup() {
        // Show loading overlay
        this.showLoading("Setting up repository...");

        // Read parameters from inputs
        let user = UI.read("setup-user");
        let name = UI.read("setup-name");

        // Request setup completion from server
        API.call("dockervisor", "repositorySetup", {
            password: localStorage.password,
            repository: {
                user: user,
                name: name
            }
        }).then(
            (result) => {
                // Next stage
                this.dashboard();
            }
        ).catch((reason) => {
            // Hide loading overlay
            this.hideLoading();

            // Alert the user
            alert(reason);
        });
    }

}