window.addEventListener("load", async function () {
    // Import modules
    await Module.import("UI", "API");

    // Initialize the application
    Dockervisor.initialize();
});

class Dockervisor {

    static initialize() {
        // Show the loading overlay
        this.showLoading("Loading application...");

        // Check whether a password has been saved
        this.checkPassword(localStorage.password || null);
    }

    static async dashboard() {
        // Show the loading overlay
        this.showLoading("Loading dashboard...");

        // Check deployment status
        let status = await API.call("dockervisor", "statusDeployment", {
            password: localStorage.password
        });

        // Change view
        UI.view("dashboard");

        // Update deployment log
        UI.write("dashboard-log", status.log);

        // Update deployment state
        UI.write("dashboard-state", status.state);

        // Hide loading overlay
        this.hideLoading();
    }

    static async checkPassword(password = UI.read("password-input")) {
        // Show loading overlay
        this.showLoading("Checking password...");

        // Check whether the password is correct
        try {
            await API.call("dockervisor", "checkPassword", {
                password: password
            });

            // Save password to localStorage
            localStorage.password = password;

            // Refresh dashboard
            await this.checkDeployment();
        } catch (e) {
            // Change the view
            UI.view("password");

            // Empty the input
            UI.write("password-input", String());

            // Hide loading overlay
            this.hideLoading();
        }
    }

    static async checkDeployment() {
        // Show loading overlay
        this.showLoading("Checking deployment...");

        // Check whether the repository is set-up
        if (await API.call("dockervisor", "checkDeployment", {
            password: localStorage.password
        })) {
            // Refresh dashboard
            await this.dashboard();
        } else {
            // Show loading overlay
            this.showLoading("Preparing setup...");

            // Load SSH key
            let key = await API.call("dockervisor", "deployKey", {
                password: localStorage.password
            });

            // Write key to UI
            UI.write("deploy-key", key);

            // Change view
            UI.view("deploy");

            // Hide loading overlay
            this.hideLoading();
        }
    }

    static async cloneDeployment() {
        // Show loading overlay
        this.showLoading("Cloning deployment...");

        // Request setup completion from server
        try {
            await API.call("dockervisor", "cloneDeployment", {
                password: localStorage.password
            });

            // Refresh dashboard
            await this.dashboard();
        } catch (e) {
            // Hide loading overlay
            this.hideLoading();
        }
    }

    static async startDeployment() {
        // Show loading overlay
        this.showLoading("Starting deployment...");

        await API.call("dockervisor", "startDeployment", {
            password: localStorage.password
        });

        // Refresh dashboard
        await this.dashboard();
    }

    static async stopDeployment() {
        // Show loading overlay
        this.showLoading("Stopping deployment...");

        await API.call("dockervisor", "stopDeployment", {
            password: localStorage.password
        });

        // Refresh dashboard
        await this.dashboard();
    }

    static async destroyDeployment() {
        // Show loading overlay
        this.showLoading("Destroing deployment...");

        await API.call("dockervisor", "destroyDeployment", {
            password: localStorage.password
        });

        // Refresh dashboard
        await this.dashboard();
    }

    static async updateDeployment() {
        // Stop deployment
        await this.stopDeployment();

        // Show loading overlay
        this.showLoading("Pulling deployment...");

        await API.call("dockervisor", "pullDeployment", {
            password: localStorage.password
        });

        // Start deployment
        await this.startDeployment();

        this.dashboard();
    }

    static showLoading(text = "Loading...") {
        UI.show("loading");
        UI.write("loading-text", text);
    }

    static hideLoading() {
        UI.hide("loading");
    }

}