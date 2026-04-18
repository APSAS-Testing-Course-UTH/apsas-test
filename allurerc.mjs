// noinspection JSUnusedGlobalSymbols
/**
 * @type {import("allure").AllureConfig}
 */
export default {
    name: "APSAS - Allure Report",
    historyPath: "./.allure/history.jsonl",
    plugins: {
        "default-view": {
            import: "@allurereport/plugin-awesome",
            options: {
                reportName: "Default View",
                groupBy: ["epic", "feature", "story"],
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
    },
    environments: {
        backend: {
            matcher: ({ labels }) => labels.find(label => label.name === "type" && label.value === "backend test") !== undefined
        },
        e2e: {
            matcher: ({ labels }) => labels.find(label => label.name === "type" && label.value === "e2e test") !== undefined
        }
    }
}
