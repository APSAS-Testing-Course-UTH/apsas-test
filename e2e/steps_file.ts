type LoginActor = {
  amOnPage: (path: string) => void
  fillField: (field: string, value: string) => void
  click: (locator: string) => void
}

export = function () {
  return actor({
    login(this: LoginActor, email: string, password: string) {
      this.amOnPage("/login")
      this.fillField("Email", email)
      this.fillField("Mật khẩu", password)
      this.click("Đăng nhập")
    },
  })
}
