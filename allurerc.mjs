// noinspection JSUnusedGlobalSymbols
/**
 * @type {import("allure").AllureConfig}
 */
export default {
    name: "APSAS - Allure Report",
    historyPath: "./.allure/history.jsonl",
    plugins: {
        "testing-type-view": {
            import: "@allurereport/plugin-awesome",
            options: {
                reportName: "Testing Type View",
                groupBy: ["type", "epic", "feature", "story"],
                filter: ({ labels }) => labels.some(label => label.name === "type"),
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
