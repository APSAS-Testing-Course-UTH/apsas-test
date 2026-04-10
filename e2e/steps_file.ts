export = function () {
  return actor({
    login(this: any, email: string, password: string) {
      this.amOnPage("/login")
      this.fillField("Email", email)
      this.fillField("Mật khẩu", password)
      this.click("Đăng nhập")
    },
  })
}
