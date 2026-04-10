Feature("Login")

Scenario("logs in as a student with valid credentials", ({ I }) => {
  const actor = I as CodeceptJS.I
  actor.amOnPage("/login")
  actor.fillField("Email", "student1@apsas")
  actor.fillField("Mật khẩu", "SecurePassword123!")
  actor.click("Đăng nhập")
  actor.waitForNavigation({})
  actor.dontSeeInCurrentUrl("/login")
})
