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
  const emailInput = await page.$(">>> [name='username']");
  const passwordInput = await page.$(">>> [name='password']");
  const loginButton = await page.$(">>> [noun='login']");

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
};

export const sendChatRequest = async (redditUserId) => {
  let page;
  try {
    console.log(`Sending dm to ${redditUserId}`);

    const user = getDmedUser.get(redditUserId);

    if (user) return console.log(`Already dmed ${redditUserId}`);

    page = await browser.newPage();

    await page.setUserAgent(process.env.USER_AGENT);

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
