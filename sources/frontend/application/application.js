window.addEventListener("load", async function () {
    // Import modules
    await Module.import("UI", "API");

    // Initialize the application
    Dockervisor.initialize();
});

class Dockervisor {

    static loading(text = "Loading...") {
        UI.view("loading");
        UI.write("loading-text", text);
    }

    static initialize() {
        // Check whether the deployment is already set-up
        API.call("dockervisor", "isSetup", {}).then(
            (state) => {
                if(state){
                    UI.view("home");
                }else{
                    UI.view("setup");
                }
            }
        ).catch(alert);
    }

}