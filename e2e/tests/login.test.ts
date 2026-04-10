Feature("Login")

Scenario("logs in as a student with valid credentials", ({ I }: { I: any }) => {
  I.amOnPage("/login")
  I.fillField("Email", "student@apsas.edu.vn")
  I.fillField("Mật khẩu", "Student@123")
  I.click("Đăng nhập")
  I.waitForNavigation()
  I.dontSeeInCurrentUrl("/login")
})
