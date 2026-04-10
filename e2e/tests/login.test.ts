Feature("Login")

Scenario("logs in as a student with valid credentials", ({ I }) => {
  const actor = I as CodeceptJS.I
  actor.amOnPage("/login")
  actor.fillField("Email", "student@apsas.edu.vn")
  actor.fillField("Mật khẩu", "Student@123")
  actor.click("Đăng nhập")
  actor.waitForNavigation({})
  actor.dontSeeInCurrentUrl("/login")
})
