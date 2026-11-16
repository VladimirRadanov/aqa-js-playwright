import { test, expect } from "@playwright/test";

const baseUrl = "https://qauto.forstudy.space/";
const login = "guest";
const password = "welcome2qauto";

function randomizeEmail() {
  return `user${Date.now() + Math.floor(Math.random() * 1000)}@example.com`;
}

const createdEmail = randomizeEmail();

async function enterField(page, selector, value) {
  const trimmedValue = value.trim();
  const field = page.locator(selector);

  await field.clear();
  if (trimmedValue) {
    await field.fill(trimmedValue);
  }
  await field.blur();
}

test.describe("Registration Actions", () => {
  // Run tests sequentially so they can safely share the authenticated context/page
  test.describe.configure({ mode: "serial" });

  /** @type {import('@playwright/test').BrowserContext} */
  let context;
  /** @type {import('@playwright/test').Page} */
  let page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      httpCredentials: {
        username: login,
        password: password,
      },
      ignoreHTTPSErrors: true,
    });
    page = await context.newPage();
  });

  test.beforeEach(async () => {
    await page.goto(baseUrl);
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(page.locator("#signupName")).toBeVisible();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.describe("Registration name validation", () => {
    test("shows a required error for an empty name", async () => {
      const nameInput = page.locator("#signupName");
      await nameInput.focus();
      await nameInput.blur();

      await expect(page.locator("div.invalid-feedback p")).toContainText(
        "Name required",
      );
    });

    test("shows an invalid error when the name contains non-English letters", async () => {
      await enterField(page, "#signupName", "John1");
      await expect(page.locator("div.invalid-feedback p")).toContainText(
        "Name is invalid",
      );
    });

    test("shows a length error when the trimmed name is shorter than 2 characters or larger 20 characters", async () => {
      await enterField(page, "#signupName", "   A   ");
      await expect(page.locator("div.invalid-feedback p")).toContainText(
        "Name has to be from 2 to 20 characters long",
      );

      await enterField(page, "#signupName", "A".repeat(21));
      await expect(page.locator("div.invalid-feedback p")).toContainText(
        "Name has to be from 2 to 20 characters long",
      );
    });

    test("shows a red border when the name is invalid", async () => {
      await enterField(page, "#signupName", "John1");
      await expect(page.locator("#signupName")).toHaveCSS(
        "border-bottom-color",
        "rgb(220, 53, 69)",
      );
    });
  });

  test.describe("Registration last name validation", () => {
    test("shows a required error for an empty last name", async () => {
      const lastNameInput = page.locator("#signupLastName");
      await lastNameInput.focus();
      await lastNameInput.blur();

      await expect(page.locator("div.invalid-feedback p")).toContainText(
        "Last name required",
      );
    });

    test("shows an invalid error when the last name contains non-English letters", async () => {
      await enterField(page, "#signupLastName", "Doe1");
      await expect(page.locator("div.invalid-feedback p")).toContainText(
        "Last name is invalid",
      );
    });

    test("shows a length error when the trimmed last name is shorter than 2 characters or longer than 20 characters", async () => {
      await enterField(page, "#signupLastName", "   D   ");
      await expect(page.locator("div.invalid-feedback p")).toContainText(
        "Last name has to be from 2 to 20 characters long",
      );

      await enterField(page, "#signupLastName", "D".repeat(21));
      await expect(page.locator("div.invalid-feedback p")).toContainText(
        "Last name has to be from 2 to 20 characters long",
      );
    });

    test("shows a red border when the last name is invalid", async () => {
      await enterField(page, "#signupLastName", "Doe1");
      await expect(page.locator("#signupLastName")).toHaveCSS(
        "border-bottom-color",
        "rgb(220, 53, 69)",
      );
    });
  });

  test.describe("Registration email validation", () => {
    test("shows an incorrect error for an invalid email", async () => {
      await enterField(page, "#signupEmail", "invalid-email");
      await expect(page.locator("div.invalid-feedback p")).toContainText(
        "Email is incorrect",
      );
    });

    test("shows a required error for an empty email", async () => {
      const emailInput = page.locator("#signupEmail");
      await emailInput.focus();
      await emailInput.blur();

      await expect(page.locator("div.invalid-feedback p")).toContainText(
        "Email required",
      );
    });

    test("shows a red border when the email is invalid", async () => {
      await enterField(page, "#signupEmail", "invalid-email");
      await expect(page.locator("#signupEmail")).toHaveCSS(
        "border-bottom-color",
        "rgb(220, 53, 69)",
      );
    });
  });

  test.describe("Registration password validation", () => {
    test("shows a policy error for a password that does not meet the requirements", async () => {
      await enterField(page, "#signupPassword", "password");
      await expect(page.locator("div.invalid-feedback p")).toContainText(
        "Password has to be from 8 to 15 characters long and contain at least one integer, one capital, and one small letter",
      );
    });

    test("shows a required error for an empty password", async () => {
      const passwordInput = page.locator("#signupPassword");
      await passwordInput.focus();
      await passwordInput.blur();

      await expect(page.locator("div.invalid-feedback p")).toContainText(
        "Password required",
      );
    });

    test("shows a red border when the password is invalid", async () => {
      await enterField(page, "#signupPassword", "password");
      await expect(page.locator("#signupPassword")).toHaveCSS(
        "border-bottom-color",
        "rgb(220, 53, 69)",
      );
    });
  });

  test.describe("Registration re-enter password validation", () => {
    test("shows an error when the passwords do not match", async () => {
      await enterField(page, "#signupPassword", "Password1");
      await enterField(page, "#signupRepeatPassword", "Password2");

      await expect(page.locator("div.invalid-feedback p")).toContainText(
        "Passwords do not match",
      );
    });

    test("shows a required error for an empty re-enter password field", async () => {
      const repeatPasswordInput = page.locator("#signupRepeatPassword");
      await repeatPasswordInput.focus();
      await repeatPasswordInput.blur();

      await expect(page.locator("div.invalid-feedback p")).toContainText(
        "Re-enter password required",
      );
    });

    test("shows a red border when the passwords do not match", async () => {
      await enterField(page, "#signupPassword", "Password1");
      await enterField(page, "#signupRepeatPassword", "Password2");

      await expect(page.locator("#signupRepeatPassword")).toHaveCSS(
        "border-bottom-color",
        "rgb(220, 53, 69)",
      );
    });
  });

  test.describe("Registration button", () => {
    test("is disabled when registration data is incorrect", async () => {
      const registerButton = page.getByRole("button", { name: "Register" });
      await expect(registerButton).toBeDisabled();

      await enterField(page, "#signupName", "John");
      await enterField(page, "#signupLastName", "Doe");
      await enterField(page, "#signupEmail", "invalid-email");
      await enterField(page, "#signupPassword", "Password1");
      await enterField(page, "#signupRepeatPassword", "Password1");

      await expect(registerButton).toBeDisabled();
    });

    test("creates a new user when valid registration data is submitted", async () => {
      await enterField(page, "#signupName", "John");
      await enterField(page, "#signupLastName", "Doe");
      await enterField(page, "#signupEmail", createdEmail);
      await enterField(page, "#signupPassword", "Password1");
      await enterField(page, "#signupRepeatPassword", "Password1");

      const registerButton = page.getByRole("button", { name: "Register" });
      await expect(registerButton).toBeEnabled();
      await registerButton.click();

      await expect(page).toHaveURL(/\/panel\/garage/);

      // Log out so the next test starts from an unauthenticated state
      await page.getByRole("button", { name: "My profile" }).click();
      await page.getByRole("button", { name: "Logout" }).click();
      await expect(page).toHaveURL(baseUrl);
    });
  });

  test.describe("UI login with a registered account", () => {
    test("logs in using the UI form", async () => {
      // Navigate fresh to close the Sign up modal opened by beforeEach
      await page.goto(baseUrl);
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.locator("#signinEmail").fill(createdEmail);
      await page.locator("#signinPassword").fill("Password1");
      await page.getByRole("button", { name: "Login" }).click();

      await expect(page).toHaveURL(/\/panel\/garage/);
    });
  });
});
