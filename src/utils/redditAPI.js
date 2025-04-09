import snoowrap from "snoowrap";

const r = new snoowrap({
  userAgent: "Bot by u/dark_light",
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

console.log(process.env.REDDIT_CLIENT_ID);
console.log(process.env.REDDIT_CLIENT_SECRET);
console.log(process.env.REDDIT_USERNAME);
console.log(process.env.REDDIT_PASSWORD);

export const scrapeNewPosts = async (subreddit) => {
  // Unauthenticated calls are limited to 100 requests per 10mins while auth are 1k requests/10mins

  const data = await r.getNew(subreddit);

  // console.log(
  //   `Rate limit remaining ${res.headers.get("x-ratelimit-remaining")}`
  // );
  // console.log(
  //   `Rate limit reset in seconds: ${res.headers.get("x-ratelimit-reset")}`
  // );

  // let data;

  // if (res.headers.get("content-type")?.includes("application/json"))
  //   data = await res.json();

  // if (res.headers.get("content-type")?.includes("text"))
  //   data = await res.text();

  // if (!data) data = await res.text();
  // if (!res.ok) {
  //   console.log(res);
  //   console.log(data);
  // }

  return data;
};
