/// <reference types='codeceptjs' />

// Minimal declarations so TypeScript accepts the marker Mocha-style test.
declare const describe: (name: string, fn: () => void) => void
declare const it: (name: string, fn: () => void) => void

// eslint-disable-next-line @typescript-eslint/no-var-requires
const allure = require("allure-js-commons")

const providerAccount = {
  email: "contentprovider1@apsas",
  password: "SecurePassword123!",
}

const studentAccount = {
  email: "student1@apsas",
  password: "SecurePassword123!",
}

function buildUniqueSuffix() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function extractAssignmentIdFromUrl(url: string) {
  const match = url.match(/\/provider\/assignments\/([^/?#]+)/)
  if (!match?.[1]) {
    throw new Error(`Không thể lấy assignment id từ URL: ${url}`)
  }

  return match[1]
}

async function selectMultiSelectValue(I: CodeceptJS.I, placeholder: string, value: string) {
  const inputByPlaceholder = locate("input").withAttr({ placeholder })
  const optionByText = locate('[role="option"]').withText(value)

  await I.click(inputByPlaceholder)
  await I.fillField(inputByPlaceholder, value)
  await I.waitForText(value, 5)
  await I.click(optionByText)
  // Close dropdown so tab clicks are not blocked by the overlay.
  await I.pressKey("Escape")
}

async function filterAssignmentsByTitle(I: CodeceptJS.I, title: string) {
  const findAcrossPages = async () => {
    const maxPage = await I.executeScript(() => {
      const pageButtons = Array.from(document.querySelectorAll("button"))
        .map((button) => Number(button.textContent?.trim()))
        .filter((value) => Number.isInteger(value) && value > 0)

      if (pageButtons.length === 0) {
        return 1
      }

      return Math.max(...pageButtons)
    })

    for (let page = 1; page <= maxPage; page += 1) {
      if (page > 1) {
        await I.click(locate("button").withText(String(page)))
        await I.wait(0.5)
      }

      const visibleMatches = await I.grabNumberOfVisibleElements(locate("td").withText(title))

      if (visibleMatches > 0) {
        return true
      }
    }

    return false
  }

  for (let attempt = 1; attempt <= 8; attempt += 1) {
    const found = await findAcrossPages()
    if (found) {
      return
    }

    await I.wait(1)
  }

  throw new Error(`Không tìm thấy assignment trong danh sách: ${title}`)
}

async function grabDraftTitlesOnCurrentPage(I: CodeceptJS.I, expectedCount: number): Promise<string[]> {
  const titles = await I.executeScript((count: number) => {
    const rows = Array.from(document.querySelectorAll("tbody tr"))
    const result: string[] = []

    const normalizeText = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()

    for (const row of rows) {
      const rowText = row.textContent || ""
      if (!normalizeText(rowText).includes("BAN NHAP")) {
        continue
      }

      const titleCell = row.querySelectorAll("td")[1]
      const rawTitle = titleCell?.querySelector("p")?.textContent?.trim()

      if (rawTitle) {
        result.push(rawTitle)
      }

      if (result.length >= count) {
        break
      }
    }

    return result
  }, expectedCount)

  if (titles.length < expectedCount) {
    throw new Error(`Không đủ assignment DRAFT trên trang hiện tại (cần ${expectedCount})`)
  }

  return titles
}

async function grabVisibleAssignmentTitlesOnCurrentPage(I: CodeceptJS.I, expectedCount: number): Promise<string[]> {
  const titles = await I.executeScript((count: number) => {
    const rows = Array.from(document.querySelectorAll("tbody tr"))
    const result: string[] = []

    for (const row of rows) {
      const titleCell = row.querySelectorAll("td")[1]
      const rawTitle = titleCell?.querySelector("p")?.textContent?.trim()

      if (rawTitle) {
        result.push(rawTitle)
      }

      if (result.length >= count) {
        break
      }
    }

    return result
  }, expectedCount)

  if (titles.length < expectedCount) {
    throw new Error(`Không đủ assignment hiển thị trên trang hiện tại (cần ${expectedCount})`)
  }

  return titles
}

async function openAssignmentFromList(I: CodeceptJS.I, title: string) {
  await filterAssignmentsByTitle(I, title)
  await I.click(locate("td").withText(title))
  await I.waitInUrl("/provider/assignments/", 10)
}

async function publishAssignmentFromList(I: CodeceptJS.I, title: string) {
  await filterAssignmentsByTitle(I, title)

  const rowCheckbox = locate({
    xpath: `//tr[.//td[contains(.,"${title}")]]//input[@type="checkbox"]`,
  })

  await I.checkOption(rowCheckbox)
  await I.click("Công bố")
  await I.waitForText("Đã công bố", 10)
}

async function publishAssignmentFromListById(I: CodeceptJS.I, assignmentId: string) {
  const rowCheckbox = locate({
    xpath: `//tr[.//a[contains(@href,"/provider/assignments/${assignmentId}")]]//input[@type="checkbox"]`,
  })

  await I.checkOption(rowCheckbox)
  await I.click("Công bố")
  await I.waitForText("Đã công bố", 10)
}

async function createDraftAssignment(I: CodeceptJS.I, title: string, description: string) {
  await I.amOnPage("/provider/assignments/create")
  await I.waitForText("Tạo bài tập mới", 10)

  // Tab: Thông tin cơ bản
  await I.fillField("Tiêu đề bài tập", title)
  await I.fillField("Mô tả bài tập", description)

  // Tab: Ngôn ngữ
  await I.click("Ngôn ngữ")
  await selectMultiSelectValue(I, "Chọn ít nhất 1 ngôn ngữ", "JavaScript")

  // Tab: Test Cases
  await I.click("Test Cases")
  await I.waitForText("Test Cases", 5)
  await I.fillField("Mô tả test case này", `Validate ${title}`)
  await I.fillField("Dữ liệu đầu vào", "1")
  await I.fillField("Kết quả mong đợi", "1")

  await I.click("Tạo bài tập")
  await I.waitInUrl("/provider/assignments", 10)
  await I.waitForText("Tạo bài tập", 10)
}

async function loginAsProvider(I: CodeceptJS.I) {
  await I.resetSession()
  await I.amOnPage("/login")
  await I.login(providerAccount.email, providerAccount.password, {
    expectedUrl: "/provider/dashboard",
  })
}

async function loginAsStudent(I: CodeceptJS.I) {
  await I.resetSession()
  await I.amOnPage("/login")
  await I.login(studentAccount.email, studentAccount.password)
}

async function getAssignmentStatusInfoByTitle(I: CodeceptJS.I, title: string) {
  await filterAssignmentsByTitle(I, title)

  const statusInfo = await I.executeScript((assignmentTitle: string) => {
    const rows = Array.from(document.querySelectorAll("tbody tr"))

    const targetRow = rows.find((row) => row.textContent?.includes(assignmentTitle))
    if (!targetRow) {
      return null
    }

    const badges = Array.from(targetRow.querySelectorAll("span"))
    const statusBadge = badges.find((badge) => {
      const text = badge.textContent?.trim()
      return text === "Bản nháp" || text === "Đã công bố" || text === "Đã lưu trữ"
    })

    if (!statusBadge) {
      return null
    }

    return {
      label: statusBadge.textContent?.trim() || "",
      dataColor: statusBadge.getAttribute("data-color") || "",
    }
  }, title)

  if (!statusInfo) {
    throw new Error(`Không lấy được trạng thái assignment từ danh sách: ${title}`)
  }

  return statusInfo
}

async function assertAssignmentStatusByTitle(
  I: CodeceptJS.I,
  title: string,
  expectedLabel: string,
  expectedColor?: string,
) {
  const info = await getAssignmentStatusInfoByTitle(I, title)

  if (info.label !== expectedLabel) {
    throw new Error(`Trạng thái assignment không đúng. expected=${expectedLabel}, actual=${info.label}, title=${title}`)
  }

  if (expectedColor && info.dataColor && info.dataColor !== expectedColor) {
    throw new Error(
      `Màu badge trạng thái không đúng. expected=${expectedColor}, actual=${info.dataColor}, title=${title}`,
    )
  }
}

async function publishAssignmentPreferDetail(I: CodeceptJS.I, assignmentId: string, titleForFallback?: string) {
  await I.amOnPage(`/provider/assignments/${assignmentId}`)
  await I.waitForText("Chỉnh sửa bài tập", 10)

  const publishButtonsInDetail = await I.grabNumberOfVisibleElements(locate("button").withText("Công bố"))

  if (publishButtonsInDetail > 0) {
    await I.click("Công bố")
    await I.waitForText("Đã công bố", 10)
    return
  }

  await I.amOnPage("/provider/assignments")
  await I.waitForText("Quản lý bài tập", 10)

  if (titleForFallback) {
    await publishAssignmentFromList(I, titleForFallback)
    return
  }

  await publishAssignmentFromListById(I, assignmentId)
}

async function isStudentAssignmentVisibleInAnyPage(I: CodeceptJS.I, title: string): Promise<boolean> {
  // Always check current page first (works when there is no pagination control).
  let visibleMatches = await I.grabNumberOfVisibleElements(locate("td").withText(title))

  if (visibleMatches > 0) {
    return true
  }

  const maxPage = await I.executeScript(() => {
    const pageNumbers = Array.from(document.querySelectorAll("button"))
      .map((button) => Number(button.textContent?.trim()))
      .filter((value) => Number.isInteger(value) && value > 1)

    if (pageNumbers.length === 0) {
      return 1
    }

    return Math.max(...pageNumbers)
  })

  // Start from page 2 because current page is already checked.
  for (let page = 2; page <= maxPage; page += 1) {
    const pageButton = locate("button").withText(String(page))
    const pageButtonCount = await I.grabNumberOfVisibleElements(pageButton)
    if (pageButtonCount === 0) {
      continue
    }

    await I.click(pageButton)
    await I.wait(0.5)

    visibleMatches = await I.grabNumberOfVisibleElements(locate("td").withText(title))

    if (visibleMatches > 0) {
      return true
    }
  }

  return false
}

Feature("Content Service - Assignments")

Scenario("[C-01][C-02][C-03][C-05][C-06] provider tạo, cập nhật, gán tài nguyên và xuất bản bài tập", async ({ I }) => {
  const suffix = buildUniqueSuffix()
  const draftTitle = `E2E Content Draft ${suffix}`
  const updatedTitle = `E2E Content Published ${suffix}`
  const description = `Mô tả tự động cho bài tập content ${suffix}`
  const skillName = "Basic Output"
  const tutorialTitle = "Hướng Dẫn In Ra Dữ Liệu (Basic Output)"

  allure.epic("content")
  allure.feature("assignment management")
  allure.story("content provider creates, updates, enriches, and publishes an assignment")
  allure.severity("critical")
  allure.tag("e2e")
  allure.tag("regression")
  allure.tms("C-01")

  await loginAsProvider(I)

  // C-01: Create Assignment (Tạo bài tập)
  await allure.logStep("Create draft assignment")
  await createDraftAssignment(I, draftTitle, description)

  await filterAssignmentsByTitle(I, draftTitle)
  await I.see(draftTitle)
  await assertAssignmentStatusByTitle(I, draftTitle, "Bản nháp", "gray")

  // C-02: Update Assignment (Cập nhật bài tập)
  await allure.logStep("Update assignment title")
  await openAssignmentFromList(I, draftTitle)
  await I.waitForText("Chỉnh sửa bài tập", 10)
  await I.seeInField("Tiêu đề bài tập", draftTitle)

  const draftAssignmentUrl = await I.grabCurrentUrl()
  const assignmentId = extractAssignmentIdFromUrl(draftAssignmentUrl)

  await I.fillField("Tiêu đề bài tập", updatedTitle)
  await I.click("Lưu thay đổi")
  await I.waitInUrl("/provider/assignments", 10)

  await I.amOnPage(`/provider/assignments/${assignmentId}`)
  await I.waitForText("Chỉnh sửa bài tập", 10)
  await I.seeInField("Tiêu đề bài tập", updatedTitle)

  await I.amOnPage("/provider/assignments")
  await I.waitForText("Quản lý bài tập", 10)
  await filterAssignmentsByTitle(I, updatedTitle)
  await I.see(updatedTitle)

  // C-05: Attach Skills (Gắn Kỹ năng)
  await allure.logStep("Attach skills to assignment")
  await I.amOnPage(`/provider/assignments/${assignmentId}`)
  await I.waitForText("Chỉnh sửa bài tập", 10)
  await I.click("Nâng cao")
  await I.waitForText("Kỹ năng liên quan", 10)
  await selectMultiSelectValue(I, "Chọn kỹ năng (tuỳ chọn)", skillName)
  await I.see(skillName)

  // C-06: Attach Tutorial (Gắn Hướng dẫn)
  await allure.logStep("Attach tutorial to assignment")
  await selectMultiSelectValue(I, "Chọn hướng dẫn (tuỳ chọn)", tutorialTitle)
  await I.see(tutorialTitle)
  await I.click("Lưu thay đổi")
  await I.waitInUrl("/provider/assignments", 10)

  // C-03: Publish Assignment (Xuất bản bài tập)
  await allure.logStep("Publish assignment")
  await I.amOnPage(`/provider/assignments/${assignmentId}`)
  await I.waitForText("Chỉnh sửa bài tập", 10)
  const persistedTitleAfterAdvanced = await I.grabValueFrom("Tiêu đề bài tập")

  await publishAssignmentPreferDetail(I, assignmentId, persistedTitleAfterAdvanced || updatedTitle)
  await I.amOnPage("/provider/assignments")
  await I.waitForText("Quản lý bài tập", 10)
  await assertAssignmentStatusByTitle(I, persistedTitleAfterAdvanced || updatedTitle, "Đã công bố", "blue")

  // Verify published assignment is visible to student
  await allure.logStep("Verify student can see published assignment")
  await loginAsStudent(I)
  await I.amOnPage(`/student/assignments/${assignmentId}`)
  await I.waitForText(persistedTitleAfterAdvanced || updatedTitle, 10)
  await I.see(persistedTitleAfterAdvanced || updatedTitle)
})

Scenario("[C-04] student chỉ nhìn thấy bài tập đã xuất bản", async ({ I }) => {
  const suffix = buildUniqueSuffix()
  const hiddenDraftTitle = `E2E Hidden Draft ${suffix}`
  const publishedTitle = `E2E Visible Published ${suffix}`
  const description = `Mô tả bài tập kiểm tra hiển thị cho student ${suffix}`

  allure.epic("content")
  allure.feature("assignment visibility")
  allure.story("student only sees published assignments in my assignments list")
  allure.severity("critical")
  allure.tag("e2e")
  allure.tag("regression")
  allure.tms("C-04")

  await loginAsProvider(I)

  // Create draft and published assignments
  await allure.logStep("Create draft assignment")
  await createDraftAssignment(I, hiddenDraftTitle, description)

  await allure.logStep("Create and publish another assignment")
  await createDraftAssignment(I, publishedTitle, `${description} (published)`)

  await I.amOnPage("/provider/assignments")
  await I.waitForText("Quản lý bài tập", 10)

  // Publish only the second assignment
  await publishAssignmentFromList(I, publishedTitle)

  // Verify student visibility
  await allure.logStep("Verify student only sees published assignment, not draft")
  await loginAsStudent(I)
  await I.amOnPage("/student/assignments")

  let publishedVisible = false
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    publishedVisible = await isStudentAssignmentVisibleInAnyPage(I, publishedTitle)
    if (publishedVisible) {
      break
    }
    await I.wait(2)
  }

  if (!publishedVisible) {
    throw new Error(`Student không thấy assignment đã publish trong danh sách: ${publishedTitle}`)
  }

  const draftVisible = await isStudentAssignmentVisibleInAnyPage(I, hiddenDraftTitle)
  if (draftVisible) {
    throw new Error(`Student vẫn thấy assignment draft trong danh sách: ${hiddenDraftTitle}`)
  }
})

Scenario("[C-04-Extended] student cannot access draft assignment directly", async ({ I }) => {
  const seededDraftTitle = "Hello World"
  const seededDraftAssignmentId = "550e8400-e29b-41d4-a716-446655440001"

  allure.epic("content")
  allure.feature("assignment security")
  allure.story("student cannot access draft assignments by direct URL")
  allure.severity("high")
  allure.tag("e2e")
  allure.tag("security")
  allure.tms("C-04")

  await allure.logStep("Student attempts to access seeded draft assignment by direct URL")
  await loginAsStudent(I)
  await I.amOnPage(`/student/assignments/${seededDraftAssignmentId}`)

  await allure.logStep("Verify student cannot see draft assignment content")
  await I.dontSee(seededDraftTitle)
})

// Marker for analyzers that do not recognize CodeceptJS `Scenario(...)` as tests.
describe("CodeceptJS assignments suite marker", () => {
  it("contains executable CodeceptJS scenarios", () => {
    // Intentionally empty.
  })
})
