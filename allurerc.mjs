// noinspection JSUnusedGlobalSymbols
/**
 * @type {import("allure").AllureConfig}
 */
export default {
    name: "APSAS - Allure Report",
    historyPath: "./.allure/history.jsonl",
    plugins: {
        "default": {
            import: "@allurereport/plugin-awesome",
            options: {
                reportName: "Default View",
                groupBy: ["epic", "feature", "story"],
                filter: ({ labels }) => labels.some(label => label.name === "epic"),
            }
        },
        "package-view": {
            import: "@allurereport/plugin-awesome",
            options: {
                reportName: "Package View",
                groupBy: ["package", "class", "method"]
            }
        },
        dashboard: {
            options: {
                reportName: "Dashboard"
            }
        }
    }
}
