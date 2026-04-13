Feature("Login")

Scenario("logs in as a student with valid credentials", ({ I }) => {
  I.loginAsStudent({
    expectedUrl: "/student/dashboard",
    timeoutInSeconds: 30,
  })
  I.waitInUrl("/student/dashboard", 30)
})
