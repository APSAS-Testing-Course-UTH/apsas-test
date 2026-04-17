/// <reference types='codeceptjs' />

export = function (): any {
  const resolveExpectedUrl = (email: string, expectedUrl?: string) => {
    if (expectedUrl) {
      return expectedUrl;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.startsWith("contentprovider")) {
      return "/provider/dashboard";
    }
    if (normalizedEmail.startsWith("instructor")) {
      return "/instructor/dashboard";
    }
    if (normalizedEmail.startsWith("student")) {
      return "/student/dashboard";
    }

    return "/student/dashboard";
  };

  return actor({
    login(
      this: CodeceptJS.I,
      email: string,
      password: string,
      options?: {
        expectedUrl?: string;
        timeoutInSeconds?: number;
        waitForRedirect?: boolean;
      },
    ) {
      this.amOnPage("/login");
      this.fillField("Email", email);
      this.fillField("Mật khẩu", password);
      this.click('button[type="submit"]');

      if (options?.waitForRedirect !== false) {
        this.waitInUrl(resolveExpectedUrl(email, options?.expectedUrl), options?.timeoutInSeconds ?? 30);
      }
    },

    registerStudent(
      this: CodeceptJS.I,
      payload: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
      },
      options?: {
        expectedUrl?: string;
        timeoutInSeconds?: number;
        waitForRedirect?: boolean;
      },
    ) {
      this.amOnPage("/register");
      this.fillField("Họ", payload.firstName);
      this.fillField("Tên", payload.lastName);
      this.fillField("Email", payload.email);
      this.fillField("Mật khẩu", payload.password);
      this.fillField("Xác nhận mật khẩu", payload.password);
      this.checkOption("Tôi đồng ý với điều khoản sử dụng");
      this.click('button[type="submit"]');

      if (options?.waitForRedirect) {
        this.waitInUrl(options?.expectedUrl ?? "/student/dashboard", options?.timeoutInSeconds ?? 30);
      }
    },

    logout(this: CodeceptJS.I) {
      this.amOnPage("/login");
      this.clearCookie();
      this.executeScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
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
