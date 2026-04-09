Feature("Register")

Scenario("shows the registration page with required fields", ({ I }) => {
  I.amOnPage("/register")
  I.seeElement('input[type="email"], input[placeholder*="email" i]')
  I.seeElement('input[type="password"], input[placeholder*="mật khẩu" i]')
})

Scenario("navigates to login page from register", ({ I }) => {
  I.amOnPage("/register")
  I.click("Đăng nhập")
  I.seeInCurrentUrl("/login")
})
