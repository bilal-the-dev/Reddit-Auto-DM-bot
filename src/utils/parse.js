export const convertRawToCacheArray = (rawArray) =>
  rawArray.map((p) => ({
    id: p.data.id,
    subreddit: p.data.subreddit,
    subredditId: p.data.subreddit_id,
  }));
