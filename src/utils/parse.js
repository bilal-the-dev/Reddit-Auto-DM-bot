export const convertRawToCacheArray = (rawArray) =>
  rawArray.map((p) => ({
    id: p.id,
    subreddit: p.subreddit.display_name,
    subredditId: p.subreddit_id,
  }));
