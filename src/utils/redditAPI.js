export const scrapeNewPosts = async (subreddit) => {
  // Unauthenticated calls are limited to 100 requests per 10mins while auth are 1k requests/10mins
  const url = `${process.env.REDDIT_BASE_URL}/r/${subreddit}/new.json`;

  const res = await fetch(url);

  console.log(
    `Rate limit remaining ${res.headers.get("x-ratelimit-remaining")}`
  );
  console.log(
    `Rate limit reset in seconds: ${res.headers.get("x-ratelimit-reset")}`
  );

  let data;

  if (res.headers.get("content-type")?.includes("application/json"))
    data = await res.json();

  if (res.headers.get("content-type")?.includes("text"))
    data = await res.text();

  if (!data) data = await res.text();
  if (!res.ok) {
    console.log(res);
    console.log(data);
  }

  return data;
};
