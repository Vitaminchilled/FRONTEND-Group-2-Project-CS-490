import { Builder, By, until } from "selenium-webdriver";
import "chromedriver";
import { describe, it, before, after } from "mocha";

describe("User Login E2E Test", function () {
  let driver;
  this.timeout(30000); // Increase timeout for slower browser actions

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async () => {
    if (driver) {
      await driver.quit(); // Safely close the browser
    }
  });

  // Helper function to logout first
  async function ensureLoggedOut() {
    try {
      await driver.get("http://localhost:5174/logout"); // Adjust if frontend route exists
    } catch (err) {
      // Ignore errors if logout page doesn't exist
    }
  }

  it("should log in with valid credentials", async () => {
    await ensureLoggedOut();
    await driver.get("http://localhost:5174/login");

    const usernameInput = await driver.wait(
      until.elementLocated(By.name("username")),
      10000
    );
    await usernameInput.sendKeys("testuser");

    const passwordInput = await driver.wait(
      until.elementLocated(By.name("password")),
      10000
    );
    await passwordInput.sendKeys("testpassword");

    const submitButton = await driver.wait(
      until.elementLocated(By.css("button[type='submit']")),
      10000
    );
    await submitButton.click();

    const welcome = await driver.wait(
      until.elementLocated(By.id("welcome-msg")),
      10000
    );
    const text = await welcome.getText();
    if (!text.includes("Welcome")) throw new Error("Login failed");
  });

  it("should show error with invalid credentials", async () => {
    await ensureLoggedOut();
    await driver.get("http://localhost:5174/login");

    const usernameInput = await driver.wait(
      until.elementLocated(By.name("username")),
      10000
    );
    await usernameInput.sendKeys("wronguser");

    const passwordInput = await driver.wait(
      until.elementLocated(By.name("password")),
      10000
    );
    await passwordInput.sendKeys("wrongpass");

    const submitButton = await driver.wait(
      until.elementLocated(By.css("button[type='submit']")),
      10000
    );
    await submitButton.click();

    const error = await driver.wait(
      until.elementLocated(By.id("error-msg")),
      10000
    );
    const text = await error.getText();
    if (!text.includes("Invalid username or password")) {
      throw new Error("Expected login error not shown");
    }
  });
});
