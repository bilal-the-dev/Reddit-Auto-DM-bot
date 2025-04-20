import puppeteer from "puppeteer";
import { getDmedUser } from "../database/queries.js";

let browser;

const shouldDebug = process.env.debug == "true";

export const loginReddit = async () => {
  browser = await puppeteer.launch({
    headless: process.env.NODE_ENV === "production",
    // devtools: process.env.NODE_ENV !== "production",
    ...(process.platform === "linux" && {
      args: ["--no-sandbox"],
      executablePath: "/usr/bin/chromium-browser",
    }),
  });

  const page = await browser.newPage();

  await page.setUserAgent(process.env.USER_AGENT);

  await page.goto(`${process.env.REDDIT_BASE_URL}/login`, {
    waitUntil: "networkidle2",
  });

  if (shouldDebug) await page.screenshot({ path: "./screenshots/app.png" });

  if (!process.env.MANUAL_LOGIN) {
    const emailInput = await page.$("[name='username']");
    const passwordInput = await page.$("[name='password']");
    const loginButton = await page.$("[noun='login'] > button");

    console.log("Typing email and pass!");

    await emailInput.tap();
    await emailInput.type(process.env.REDDIT_EMAIL);
    await passwordInput.tap();
    await passwordInput.type(process.env.REDDIT_PASSWORD);

    await new Promise((res) =>
      setTimeout(() => {
        res();
      }, 1000 * 3)
    );

    if (shouldDebug) await page.screenshot({ path: "./screenshots/creds.png" });

    await loginButton.click();

    console.log("Clicked login!");

    if (shouldDebug) await page.screenshot({ path: "./screenshots/login.png" });

    await page.waitForNavigation({ waitUntil: "networkidle2" });

    if (shouldDebug) await page.screenshot({ path: "./screenshots/home.png" });
  }
};

export const sendChatRequest = async (redditUserId) => {
  let page;
  try {
    console.log(`Sending dm to ${redditUserId}`);

    const user = getDmedUser.get(redditUserId);

    if (user) return console.log(`Already dmed ${redditUserId}`);

    page = await browser.newPage();

    await page.setUserAgent(process.env.USER_AGENT);

    await page.setRequestInterception(true);

    page.on("request", async (request) => {
      const url = request.url();
      const method = request.method();
      const headers = request.headers();
      const postData = request.postData();

      // Only interested in fetch/XHR requests
      if (request.resourceType() === "fetch") {
        console.log(`\n>>> FETCH REQUEST >>>`);
        console.log(`URL: ${url}`);
        console.log(`Method: ${method}`);
        console.log(`Headers: ${JSON.stringify(headers, null, 2)}`);
        if (postData) console.log(`Body: ${postData}`);
      }

      request.continue();
    });

    page.on("response", async (response) => {
      try {
        const request = response.request();
        const resourceType = request.resourceType();
        const responseHeaders = response.headers();
        const contentType = responseHeaders["content-type"] || "";

        // Only log fetch responses with application/json
        if (
          resourceType === "fetch" &&
          contentType.includes("application/json")
        ) {
          const url = response.url();
          const status = response.status();
          const jsonBody = await response.json();

          console.log(`\n<<< FETCH RESPONSE <<<`);
          console.log(`URL: ${url}`);
          console.log(`Status: ${status}`);
          console.log(`Content-Type: ${contentType}`);
          console.log(`JSON Body: ${JSON.stringify(jsonBody, null, 2)}`);
        }
      } catch (err) {
        console.error(err);
      }
    });

    await page.goto(
      `${process.env.REDDIT_CHAT_BASE_URL}/user/${redditUserId}`,
      {
        waitUntil: "networkidle2",
      }
    );

    await new Promise((res) =>
      setTimeout(() => {
        res();
      }, 1000 * 3)
    );

    if (shouldDebug)
      await page.screenshot({
        path: `./screenshots/chat-${redditUserId}-1.png`,
      });

    const textarea = await page.$(">>> textarea[name='message']");

    await textarea.type(process.env.INBOX_MESSAGE);

    const submitBtn = await page.$(">>> button[aria-label='Send message']");

    if (shouldDebug)
      await page.screenshot({
        path: `./screenshots/chat-${redditUserId}-2.png`,
      });

    await submitBtn.click();

    if (shouldDebug)
      await page.screenshot({
        path: `./screenshots/chat-${redditUserId}-3.png`,
      });

    console.log("Done!!");

    await page.close();
    return true;
  } catch (error) {
    console.log(error);

    if (page) await page.close();

    return true;
  }
};
