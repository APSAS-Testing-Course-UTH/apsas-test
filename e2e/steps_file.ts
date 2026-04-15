/// <reference types='codeceptjs' />

export = function (): any {
  return actor({
    login(this: CodeceptJS.I, email: string, password: string) {
      this.amOnPage("/login");
      this.fillField("Email", email);
      this.fillField("Mật khẩu", password);
      this.click("Đăng nhập");
    },

    resetSession(this: CodeceptJS.I) {
      this.clearCookie();
      this.amOnPage("/login");
      this.executeScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    },
  });
};
