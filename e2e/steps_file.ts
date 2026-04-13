const defaultSeedPassword = process.env.E2E_SEED_PASSWORD || "SecurePassword123!"

declare const actor: <T extends Record<string, unknown>>(steps: T) => T

const seedAccounts = {
  student: {
    email: process.env.E2E_STUDENT_EMAIL || "student1@apsas",
    password: process.env.E2E_STUDENT_PASSWORD || defaultSeedPassword,
  },
  instructor: {
    email: process.env.E2E_INSTRUCTOR_EMAIL || "instructor1@apsas",
    password: process.env.E2E_INSTRUCTOR_PASSWORD || defaultSeedPassword,
  },
}

export = function (): any {
  return actor({
    login(
      this: CodeceptJS.I,
      email: string,
      password: string,
      options?: {
        expectedUrl?: string
        timeoutInSeconds?: number
        waitForRedirect?: boolean
      },
    ) {
      this.amOnPage("/login")
      this.executeScript(() => {
        localStorage.clear()
        sessionStorage.clear()
      })
      this.waitForElement("input[placeholder^='Nhập email']", 20)
      this.waitForElement("input[placeholder^='Nhập mật khẩu']", 20)
      this.fillField("input[placeholder^='Nhập email']", email)
      this.fillField("input[placeholder^='Nhập mật khẩu']", password)
      this.click("Đăng nhập")

      if (options?.waitForRedirect !== false) {
        this.waitInUrl(
          options?.expectedUrl ?? "/student/dashboard",
          options?.timeoutInSeconds ?? 30,
        )
      }
    },

    loginAsStudent(
      this: CodeceptJS.I,
      options?: {
        expectedUrl?: string
        timeoutInSeconds?: number
        waitForRedirect?: boolean
      },
    ) {
      this.login(seedAccounts.student.email, seedAccounts.student.password, {
        expectedUrl: options?.expectedUrl ?? "/student/dashboard",
        timeoutInSeconds: options?.timeoutInSeconds ?? 30,
        waitForRedirect: options?.waitForRedirect,
      })
    },

    loginAsInstructor(
      this: CodeceptJS.I,
      options?: {
        expectedUrl?: string
        timeoutInSeconds?: number
        waitForRedirect?: boolean
      },
    ) {
      this.login(seedAccounts.instructor.email, seedAccounts.instructor.password, {
        expectedUrl: options?.expectedUrl ?? "/instructor/dashboard",
        timeoutInSeconds: options?.timeoutInSeconds ?? 30,
        waitForRedirect: options?.waitForRedirect,
      })
    },

    logout(this: CodeceptJS.I) {
      this.amOnPage("/login")
      this.clearCookie()
      this.executeScript(() => {
        localStorage.clear()
        sessionStorage.clear()
      })
    },
  })
}

