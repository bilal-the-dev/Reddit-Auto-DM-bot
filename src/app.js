import { createdDmedUser } from "./database/queries.js";
import { convertRawToCacheArray } from "./utils/parse.js";
import { scrapeNewPosts } from "./utils/redditAPI.js";
import { loginReddit, sendChatRequest } from "./utils/redditScraper.js";

const subreddits = process.env.subreddits.split(",");

const cachedData = [];
const lastScrapedAtCache = {};
let lastDmSentAt;

await loginReddit();

while (true) {
  if (cachedData.length > 0)
    await new Promise((res) =>
      setTimeout(
        () => {
          res();
        },
        1000 * 60 * 1
      )
    );

  for (const subreddit of subreddits) {
    try {
      console.log(`Scraping new posts for ${subreddit}`);

      const fetchedPosts = await scrapeNewPosts(subreddit);

      if (!lastScrapedAtCache[subreddit])
        lastScrapedAtCache[subreddit] = Date.now();

      console.log(`Fetched ${fetchedPosts.length} posts! Filtering!`);

      const subredditCachedPostIds = cachedData
        .filter((c) => c.subreddit === subreddit)
        .map((c) => c.id);

      if (subredditCachedPostIds.length === 0) {
        console.log("First time filling in cache, returning!");

        cachedData.push(...convertRawToCacheArray(fetchedPosts));

        continue;
      }

      const newPosts = fetchedPosts.filter(
        (p) =>
          !subredditCachedPostIds.includes(p.id) &&
          p.created_utc * 1000 > lastScrapedAtCache[subreddit] // since it sometimes give old posts and create_utc is in seconds
      );

      console.log(`Fetched ${newPosts.length} new posts!`);

      for (const newPost of newPosts) {
        console.log(
          `Sending dm to ${newPost.author.name} (${newPost.author_fullname})`
        );

        const canSendDm = lastDmSentAt + 1000 * 60 * 8 < Date.now();

        if (canSendDm) {
          const hasNotDmedAlready = await sendChatRequest(
            newPost.author_fullname
          );
          if (hasNotDmedAlready) {
            createdDmedUser.run(newPost.author_fullname, newPost.author.name);
            lastDmSentAt = Date.now();
          }
        }

        if (!canSendDm)
          console.log(
            "Looks like, its not been 8mins since last dm was sent, skipping!"
          );

        cachedData.push(...convertRawToCacheArray([newPost]));
      }

      lastScrapedAtCache[subreddit] = Date.now();
    } catch (error) {
      console.log(error);
    }
  }
}
