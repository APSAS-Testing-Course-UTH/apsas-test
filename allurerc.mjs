import {defineConfig} from "allure";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    name: "APSAS - Allure Report",
    historyPath: "./.allure/history.jsonl",
    plugins: {
        awesome: {
            options: {
                publish: true
            }
        }
    }
});
