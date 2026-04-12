export = function (): any {
  return actor({
    login(this: CodeceptJS.I, email: string, password: string) {
      this.amOnPage("/login");
      this.fillField("Email", email);
      this.fillField("Mật khẩu", password);
      this.click("Đăng nhập");
    },

    registerStudent(
      this: CodeceptJS.I,
      payload: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
      },
    ) {
      this.amOnPage("/register");
      this.fillField("Họ", payload.firstName);
      this.fillField("Tên", payload.lastName);
      this.fillField("Email", payload.email);
      this.fillField("Mật khẩu", payload.password);
      this.fillField("Xác nhận mật khẩu", payload.password);
      this.checkOption("Tôi đồng ý với điều khoản sử dụng");
      this.click("Tạo tài khoản");
    },

    logout(this: CodeceptJS.I) {
      this.amOnPage("/login");
      this.clearCookie();
      this.executeScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    },
  });
}
