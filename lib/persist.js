require("dotenv").config();

const moment = require("moment");
const { getCurrentEmojis } = require("./slack");

const makeRedisClient = async () => {
  const redis = require("redis").createClient({
    url: process.env.REDIS_URL,
  });
  redis.on("error", (err) => console.log("Redis Client Error", err));
  await redis.connect();

  return redis;
};

const FORBIDDEN_DAYS_OF_WEEK = ["Saturday", "Sunday"];

const getLastKnownEmoji = async () => {
  const redis = await makeRedisClient();
  const last_known = await redis.get("last_known");

  if (!last_known) {
    return {};
  }

  return JSON.parse(last_known);
};

const storeEmojiDiff = async (emoji) => {
  const redis = await makeRedisClient();
  const today = moment();
  const todayKey = today.format("MM-DD-YYYY");

  return redis.set(todayKey, JSON.stringify(emoji));
};

const storeEmojiList = async (list) => {
  const redis = await makeRedisClient();
  return redis.set("last_known", JSON.stringify(list));
};

const getRandomMeow = async () => {
  const redis = await makeRedisClient();
  const emojis = await redis.get("last_known");
  const emoji_json = JSON.parse(emojis);
  const meow_emojis = Object.keys(emoji_json).filter((e) =>
    e.includes("meow_")
  );
  const random = meow_emojis[Math.floor(Math.random() * meow_emojis.length)];

  return random;
};

const getEmojiAnniversaries = async () => {
  const redis = await makeRedisClient();
  const lastYear = moment().subtract(1, "year");
  const key = lastYear.format("MM-DD-YYYY");
  const emoji = await redis.get(key);

  if (!emoji) {
    return {};
  }

  return JSON.parse(emoji);
};

module.exports = {
  getLastKnownEmoji: getLastKnownEmoji,
  storeEmojiDiff: storeEmojiDiff,
  storeEmojiList: storeEmojiList,
  getRandomMeow: getRandomMeow,
  getEmojiAnniversaries: getEmojiAnniversaries,
};
