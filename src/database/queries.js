import db from "./index.js";

export const getDmedUser = db.prepare(
  `SELECT * FROM dmed_users WHERE reddit_user_id = ?`
);

export const createdDmedUser = db.prepare(
  `INSERT into dmed_users (reddit_user_id, reddit_user_username) VALUES (?,?)`
);
