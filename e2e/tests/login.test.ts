type LoginScenarioActor = {
  amOnPage: (path: string) => void
  fillField: (field: string, value: string) => void
  click: (locator: string) => void
  waitForNavigation: () => void
  dontSeeInCurrentUrl: (url: string) => void
}

Feature("Login")

Scenario("logs in as a student with valid credentials", ({ I }) => {
  const actor = I as unknown as LoginScenarioActor
  actor.amOnPage("/login")
  actor.fillField("Email", "student@apsas.edu.vn")
  actor.fillField("Mật khẩu", "Student@123")
  actor.click("Đăng nhập")
  actor.waitForNavigation()
  actor.dontSeeInCurrentUrl("/login")
})
