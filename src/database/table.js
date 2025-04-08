import db from "./index.js";

db.exec(`CREATE TABLE IF NOT EXISTS dmed_users(
    reddit_user_id TEXT NOT NULL,
    reddit_user_username TEXT NOT NULL
)`);
