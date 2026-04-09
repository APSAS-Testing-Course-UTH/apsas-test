Feature("Login")

Scenario("shows the login page with required fields", ({ I }) => {
  I.amOnPage("/login")
  I.see("Đăng nhập vào APSAS")
  I.seeElement('input[type="email"], input[placeholder*="email" i]')
  I.seeElement('input[type="password"], input[placeholder*="mật khẩu" i]')
  I.seeElement('button[type="submit"]')
})

Scenario("logs in as a student with valid credentials", ({ I }) => {
  I.amOnPage("/login")
  I.fillField("Email", "student@apsas.edu.vn")
  I.fillField("Mật khẩu", "Student@123")
  I.click("Đăng nhập")
  I.waitForNavigation()
  I.dontSeeInCurrentUrl("/login")
})

Scenario("shows validation error for empty form submission", ({ I }) => {
  I.amOnPage("/login")
  I.click("Đăng nhập")
  I.waitForElement('.mantine-TextInput-error, .mantine-PasswordInput-error, [class*="error"]', 5)
})

Scenario("navigates to forgot password page", ({ I }) => {
  I.amOnPage("/login")
  I.click("Quên mật khẩu?")
  I.seeInCurrentUrl("/forgot-password")
})

Scenario("navigates to register page", ({ I }) => {
  I.amOnPage("/login")
  I.click("Đăng ký")
  I.seeInCurrentUrl("/register")
})
