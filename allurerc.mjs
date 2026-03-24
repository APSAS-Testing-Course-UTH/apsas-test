// noinspection JSUnusedGlobalSymbols
/**
 * @type {import("allure").AllureConfig}
 */
export default {
    name: "APSAS - Allure Report",
    historyPath: "./.allure/history.jsonl",
    plugins: {
        awesome: {
            options: {
                publish: true
            }
        }
    }
}
