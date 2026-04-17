Feature("Login")

Scenario("logs in as a student with valid credentials", ({ I }) => {
  I.amOnPage("/login")
  I.fillField("Email", "student1@apsas")
  I.fillField("Mật khẩu", "SecurePassword123!")
  I.click("Đăng nhập")
  I.waitInUrl("/student/dashboard", 10)
})

Scenario("logs in as a provider with valid credentials", ({ I }) => {
  I.login("contentprovider1@apsas", "SecurePassword123!", {
    timeoutInSeconds: 30,
  })
  I.waitInUrl("/provider/dashboard", 30)
})
