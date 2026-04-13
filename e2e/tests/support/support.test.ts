/// <reference path="../../steps.d.ts" />

import * as allure from "allure-js-commons"

const SUPPORT_ISSUE_ID = "33"

declare const Feature: (title: string) => unknown
declare const Scenario: (
  title: string,
  callback: (ctx: ScenarioContext) => Promise<void> | void,
) => unknown

type ScenarioContext = { I: CodeceptJS.I }

type ScenarioSeverity = "critical" | "normal" | "minor"

interface ScenarioMetadata {
  feature: string
  story: string
  severity: ScenarioSeverity
  tms: string
}

function uniqueToken(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function extractMessageKey(message: string): string {
  return message.trim().split(/\s+/)[0] ?? message
}

async function grabSessionLabelByMessageKey(
  I: CodeceptJS.I,
  messageKey: string,
): Promise<string> {
  const rawLabel = await I.executeScript((targetMessageKey: string) => {
    const items = Array.from(document.querySelectorAll("[class*='sessionItem']"))

    const target = items.find((item) => {
      const text = item.textContent?.replace(/\s+/g, " ").trim() ?? ""
      return text.includes(targetMessageKey)
    })

    if (!target) {
      return ""
    }

    const text = target.textContent?.replace(/\s+/g, " ").trim() ?? ""
    const match = text.match(/Yêu cầu\s*#[a-z0-9]{8}/i)
    return match?.[0] ?? ""
  }, messageKey)

  const sessionLabel = normalizeWhitespace(String(rawLabel))
  if (!sessionLabel) {
    throw new Error(`Unable to capture support session label for message key: ${messageKey}`)
  }

  return sessionLabel
}

async function clickSessionFromSidebar(
  I: CodeceptJS.I,
  sessionLabel: string,
): Promise<void> {
  const maxPageHops = 15

  for (let hop = 0; hop < maxPageHops; hop += 1) {
    const foundAndClicked = await I.executeScript((targetLabel: string) => {
      const items = Array.from(document.querySelectorAll("[class*='sessionItem']"))
      const target = items.find((item) => {
        const text = item.textContent?.replace(/\s+/g, " ").trim() ?? ""
        return text.includes(targetLabel)
      }) as HTMLElement | undefined

      if (!target) {
        return false
      }

      target.scrollIntoView({ block: "center" })
      target.click()
      return true
    }, sessionLabel)

    if (foundAndClicked) {
      return
    }

    const movedToNextPage = await I.executeScript(() => {
      const paginationRoot = document.querySelector("[class*='Pagination-root']")
      if (!paginationRoot) {
        return false
      }

      const pageButtons = Array.from(paginationRoot.querySelectorAll("button"))
        .filter((button) => /^\d+$/.test(button.textContent?.trim() ?? "")) as HTMLButtonElement[]

      if (pageButtons.length === 0) {
        return false
      }

      const activeIndex = pageButtons.findIndex((button) => {
        return (
          button.getAttribute("aria-current") === "page" ||
          button.getAttribute("data-active") === "true"
        )
      })

      if (activeIndex < 0 || activeIndex + 1 >= pageButtons.length) {
        return false
      }

      pageButtons[activeIndex + 1].click()
      return true
    })

    if (!movedToNextPage) {
      break
    }

    I.waitForElement("[class*='sessionItem']", 20)
  }

  throw new Error(`Could not find support session in sidebar: ${sessionLabel}`)
}

async function applyMetadata(metadata: ScenarioMetadata): Promise<void> {
  await allure.epic("support")
  await allure.feature(metadata.feature)
  await allure.story(metadata.story)
  await allure.severity(metadata.severity)
  await allure.tag("e2e")
  await allure.tag("regression")
  await allure.tms(metadata.tms)
  await allure.issue(SUPPORT_ISSUE_ID)
}

async function createSupportSession(I: CodeceptJS.I, initialMessage: string): Promise<string> {
  const messageKey = extractMessageKey(initialMessage)

  I.amOnPage("/student/support")
  I.waitForText("Yêu cầu hỗ trợ", 20)
  I.click("Tạo yêu cầu")
  I.waitForElement("div[role='dialog']", 10)
  I.waitForText("Tạo yêu cầu hỗ trợ mới", 10)
  I.fillField(
    "div[role='dialog'] textarea[placeholder^='Mô tả chi tiết vấn đề của bạn']",
    initialMessage,
  )
  I.click({
    xpath: "//div[@role='dialog']//button[normalize-space()='Tạo yêu cầu' and not(@disabled)]",
  })
  I.waitForInvisible("div[role='dialog']", 20)
  I.waitForFunction((targetMessageKey: string) => {
    const items = Array.from(document.querySelectorAll("[class*='sessionItem']"))
    return items.some((item) => {
      const text = item.textContent?.replace(/\s+/g, " ").trim() ?? ""
      return text.includes(targetMessageKey)
    })
  }, [messageKey], 30)
  I.waitForText(initialMessage, 20)

  return grabSessionLabelByMessageKey(I, messageKey)
}

async function openInstructorSessionFromList(I: CodeceptJS.I, sessionLabel: string): Promise<void> {
  I.amOnPage("/instructor/support")
  I.waitForText("Hỗ trợ Sinh viên", 20)
  I.click({ css: "button[title='Làm mới danh sách']" })
  I.waitForElement("[class*='sessionItem']", 20)
  await clickSessionFromSidebar(I, sessionLabel)
  I.waitForElement("textarea[placeholder^='Nhập tin nhắn']", 20)
}

async function openStudentSessionFromList(I: CodeceptJS.I, sessionLabel: string): Promise<void> {
  I.amOnPage("/student/support")
  I.waitForText("Yêu cầu hỗ trợ", 20)
  I.click({ css: "button[title='Làm mới danh sách']" })
  I.waitForElement("[class*='sessionItem']", 20)
  await clickSessionFromSidebar(I, sessionLabel)
  I.waitForElement("textarea[placeholder^='Nhập tin nhắn']", 20)
}

function sendChatMessage(I: CodeceptJS.I, content: string) {
  I.fillField("textarea[placeholder^='Nhập tin nhắn']", content)
  I.pressKey("Enter")
  I.waitForText(content, 20)
}

function closeCurrentSession(I: CodeceptJS.I) {
  I.click({
    xpath: "//button[.//*[contains(@class,'tabler-icon-x')]]",
  })
  I.waitForText("Đóng yêu cầu hỗ trợ", 10)
  I.click({
    xpath: "(//button[normalize-space()='Đóng yêu cầu'])[last()]",
  })
}

function assertClosedSessionUi(I: CodeceptJS.I) {
  I.waitForFunction(() => {
    const text = document.body.innerText.toUpperCase()
    return text.includes("CLOSED") || text.includes("ĐÃ ĐÓNG")
  }, [], 20)

  I.waitForFunction(() => {
    const textarea = document.querySelector(
      "textarea[placeholder^='Nhập tin nhắn']",
    ) as HTMLTextAreaElement | null
    const sendButton = document.querySelector(
      "button[title='Nhấn Enter hoặc click để gửi']",
    ) as HTMLButtonElement | null

    const textareaLocked =
      !textarea ||
      textarea.disabled ||
      textarea.hasAttribute("disabled") ||
      textarea.getAttribute("aria-disabled") === "true"

    const sendButtonLocked =
      !sendButton ||
      sendButton.disabled ||
      sendButton.hasAttribute("disabled") ||
      sendButton.getAttribute("aria-disabled") === "true"

    return textareaLocked && sendButtonLocked
  }, [], 20)
}

Feature("Support Service")

Scenario("SP-01: Student opens a support session", async ({ I }: ScenarioContext) => {
  await applyMetadata({
    feature: "session creation",
    story: "student creates a support request",
    severity: "critical",
    tms: "SUP-E2E-001",
  })

  const token = uniqueToken()
  const initialMessage = `SP01-${token} cần hỗ trợ`

  I.loginAsStudent()
  await createSupportSession(I, initialMessage)

  I.see(initialMessage)
  I.see("MỞ")
})

Scenario("SP-02: Instructor sees student session in support list", async ({ I }: ScenarioContext) => {
  await applyMetadata({
    feature: "session queue",
    story: "instructor sees newly created support request",
    severity: "critical",
    tms: "SUP-E2E-002",
  })

  const token = uniqueToken()
  const initialMessage = `SP02-${token} cần hỗ trợ`

  I.loginAsStudent()
  const sessionLabel = await createSupportSession(I, initialMessage)

  I.logout()
  I.loginAsInstructor()
  await openInstructorSessionFromList(I, sessionLabel)

  I.see(sessionLabel)
  I.see(initialMessage)
})

Scenario("SP-03: Instructor replies in support chat", async ({ I }: ScenarioContext) => {
  await applyMetadata({
    feature: "chat response",
    story: "instructor sends a response to student",
    severity: "critical",
    tms: "SUP-E2E-003",
  })

  const token = uniqueToken()
  const initialMessage = `SP03-${token.slice(-6)}`
  const instructorReply = `SP03-R-${token.slice(-5)}`

  I.loginAsStudent()
  const sessionLabel = await createSupportSession(I, initialMessage)

  I.logout()
  I.loginAsInstructor()
  await openInstructorSessionFromList(I, sessionLabel)
  sendChatMessage(I, instructorReply)

  I.see(instructorReply)
})

Scenario("SP-04: Student sees instructor message and replies", async ({ I }: ScenarioContext) => {
  await applyMetadata({
    feature: "two-way chat",
    story: "student continues conversation after instructor reply",
    severity: "critical",
    tms: "SUP-E2E-004",
  })

  const token = uniqueToken()
  const initialMessage = `SP04-${token.slice(-6)}`
  const instructorReply = `SP04-R-${token.slice(-5)}`
  const studentReply = `SP04-S-${token.slice(-5)}`

  I.loginAsStudent()
  const sessionLabel = await createSupportSession(I, initialMessage)

  I.logout()
  I.loginAsInstructor()
  await openInstructorSessionFromList(I, sessionLabel)
  sendChatMessage(I, instructorReply)

  I.logout()
  I.loginAsStudent()
  await openStudentSessionFromList(I, sessionLabel)

  I.see(instructorReply)
  sendChatMessage(I, studentReply)
  I.see(studentReply)
})

Scenario("SP-05: Session keeps long message history visible", async ({ I }: ScenarioContext) => {
  await applyMetadata({
    feature: "message history",
    story: "student can access long chat history without losing new messages",
    severity: "normal",
    tms: "SUP-E2E-005",
  })

  const token = uniqueToken()
  const initialMessage = `SP05-${token} tạo phiên hỗ trợ`
  const totalMessages = 21
  let firstMessage = ""
  let lastMessage = ""

  I.loginAsStudent()
  await createSupportSession(I, initialMessage)

  for (let index = 1; index <= totalMessages; index += 1) {
    const message = `SP05-${token}-${String(index).padStart(2, "0")}`
    sendChatMessage(I, message)

    if (index === 1) {
      firstMessage = message
    }
    lastMessage = message
  }

  I.click({ xpath: "(//button[@title='Làm mới'])[last()]" })
  I.waitForText(firstMessage, 30)

  I.executeScript(() => {
    const viewport = document.querySelector(".mantine-ScrollArea-viewport") as HTMLElement | null
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight
    }
  })

  I.waitForText(lastMessage, 15)
  I.see(lastMessage)
})

Scenario("SP-06: Student closes session and input is disabled or hidden", async ({ I }: ScenarioContext) => {
  await applyMetadata({
    feature: "session lifecycle",
    story: "student closes support request",
    severity: "critical",
    tms: "SUP-E2E-006",
  })

  const token = uniqueToken()
  const initialMessage = `SP06-${token} cần đóng phiên`

  I.loginAsStudent()
  await createSupportSession(I, initialMessage)
  closeCurrentSession(I)

  I.waitForText("Yêu cầu này đã được đóng", 20)
  assertClosedSessionUi(I)
})
