import { access } from "node:fs/promises"
import path from "node:path"
import * as allure from "allure-js-commons"
import { ContentType } from "allure-js-commons"

Feature("Identity Service - Authentication and User Management")

const ISSUE_ID = "36"

type Metadata = {
  feature: string
  story: string
  severity: "critical" | "normal" | "minor"
  tms: string
}

async function applyMetadata(meta: Metadata) {
  await allure.epic("identity")
  await allure.feature(meta.feature)
  await allure.story(meta.story)
  await allure.severity(meta.severity)
  await allure.tag("e2e")
  await allure.tag("regression")
  await allure.tms(meta.tms)
  await allure.issue(ISSUE_ID)
}

async function withFailureScreenshot(I: CodeceptJS.I, scenarioId: string, fn: () => Promise<void>) {
  try {
    await fn()
  } catch (error) {
    const screenshotName = `${scenarioId}-${Date.now()}.png`
    const screenshotPath = path.resolve(__dirname, "../../output", screenshotName)

    await I.saveScreenshot(screenshotName, true)
    await waitForFile(screenshotPath)

    await allure.attachmentPath(`${scenarioId} failure screenshot`, screenshotPath, {
      contentType: ContentType.PNG,
      fileExtension: "png",
    })

    throw error
  }
}

async function waitForFile(filePath: string, timeoutMs = 4000) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      await access(filePath)
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
}

Scenario("I-01 đăng ký với email mới thành công", async ({ I }) => {
  await applyMetadata({
    feature: "authentication",
    story: "Student registration success",
    severity: "critical",
    tms: "IDT-AUTH-001",
  })

  await withFailureScreenshot(I, "I-01", async () => {
    const uniqueEmail = `e2e.student.${Date.now()}@example.com`

    I.registerStudent({
      firstName: "E2E",
      lastName: "Student",
      email: uniqueEmail,
      password: "SecurePassword123!",
    })

    I.waitForText("Tài khoản đã được tạo", 30)
  })
})

Scenario("I-02 đăng ký với email đã tồn tại thất bại", async ({ I }) => {
  await applyMetadata({
    feature: "authentication",
    story: "Student registration duplicate email",
    severity: "critical",
    tms: "IDT-AUTH-002",
  })

  await withFailureScreenshot(I, "I-02", async () => {
    const duplicateEmail = `e2e.duplicate.${Date.now()}@example.com`

    I.registerStudent(
      {
        firstName: "Seed",
        lastName: "User",
        email: duplicateEmail,
        password: "SecurePassword123!",
      },
      {
        waitForRedirect: true,
        timeoutInSeconds: 30,
      },
    )

    I.waitInUrl("/student/dashboard", 30)
    I.logout()

    I.registerStudent({
      firstName: "Seed",
      lastName: "User",
      email: duplicateEmail,
      password: "SecurePassword123!",
    })

    I.waitInUrl("/register", 30)
    I.dontSeeInCurrentUrl("/student/dashboard")
    I.seeInField("Email", duplicateEmail)
    I.seeElement("button[type='submit']")
  })
})

Scenario("I-03 đăng nhập Student thành công", async ({ I }) => {
  await applyMetadata({
    feature: "authentication",
    story: "Student login success",
    severity: "critical",
    tms: "IDT-AUTH-003",
  })

  await withFailureScreenshot(I, "I-03-STUDENT", async () => {
    I.login("student1@apsas", "SecurePassword123!", {
      timeoutInSeconds: 30,
    })
    I.waitInUrl("/student/dashboard", 30)
    I.see("Hành động nhanh")
  })
})

Scenario("I-03 đăng nhập Instructor thành công", async ({ I }) => {
  await applyMetadata({
    feature: "authentication",
    story: "Instructor login success",
    severity: "critical",
    tms: "IDT-AUTH-004",
  })

  await withFailureScreenshot(I, "I-03-INSTRUCTOR", async () => {
    I.login("instructor1@apsas", "SecurePassword123!", {
      expectedUrl: "/instructor/dashboard",
      timeoutInSeconds: 30,
    })
    I.waitInUrl("/instructor/dashboard", 30)
    I.see("Bảng điều khiển Giảng viên")
  })
})

Scenario("I-04 đăng nhập sai mật khẩu", async ({ I }) => {
  await applyMetadata({
    feature: "authentication",
    story: "Invalid credential login failure",
    severity: "critical",
    tms: "IDT-AUTH-005",
  })

  await withFailureScreenshot(I, "I-04", async () => {
    I.amOnPage("/login")
    I.fillField("Email", "student1@apsas")
    I.fillField("Mật khẩu", "WrongPassword123!")
    I.click("Đăng nhập")

    I.waitForText("Đăng nhập thất bại", 10)
    I.waitInUrl("/login", 10)
    I.dontSeeInCurrentUrl("/student/dashboard")
    I.see("Đăng nhập vào APSAS")
  })
})

Scenario("I-05 cập nhật profile và giữ dữ liệu sau refresh", async ({ I }) => {
  await applyMetadata({
    feature: "profile-management",
    story: "Profile update persists after refresh",
    severity: "normal",
    tms: "IDT-PROF-001",
  })

  await withFailureScreenshot(I, "I-05", async () => {
    const firstName = `E2E${Date.now()}`
    const lastName = "Profile"

    I.login("student2@apsas", "SecurePassword123!", {
      timeoutInSeconds: 30,
    })
    I.waitInUrl("/student/dashboard", 30)

    I.amOnPage("/student/profile")
    I.waitForText("Hồ sơ cá nhân", 10)
    I.click("Chỉnh sửa thông tin")

    I.waitForText("Cập nhật thông tin", 10)
    I.fillField("Họ", firstName)
    I.fillField("Tên", lastName)
    I.click("Lưu")

    I.waitForText("Cập nhật thông tin thành công", 10)
    I.refreshPage()
    I.waitForText("Hồ sơ cá nhân", 10)
    I.see(`${firstName} ${lastName}`)
  })
})

Scenario("I-06 không đăng nhập truy cập instructor dashboard bị redirect", async ({ I }) => {
  await applyMetadata({
    feature: "authorization-ui",
    story: "Anonymous user redirected from instructor dashboard",
    severity: "critical",
    tms: "IDT-AUTHZ-001",
  })

  await withFailureScreenshot(I, "I-06", async () => {
    I.logout()
    I.amOnPage("/instructor/dashboard")
    I.waitInUrl("/login", 10)
    I.see("Đăng nhập vào APSAS")
  })
})
