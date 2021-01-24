require("dotenv").config();
const redis = require("redis").createClient(process.env.REDIS_URL);
const { promisify } = require("util");
const get = promisify(redis.get).bind(redis); // this maps redis.get(key, callback(results)) to a promise-compatible function
const moment = require("moment");
const { getCurrentEmojis } = require("./slack");

const FORBIDDEN_DAYS_OF_WEEK = ["Saturday", "Sunday"];

const getLastKnownEmoji = async (todayIso) => {
  const week = await Promise.all(
    Array.from(Array(7)).map((_, idx) => {
      const key = moment(todayIso)
        .subtract(idx + 1, "day")
        .format("MM-DD-YYYY");
      return get(key);
    })
  );

  const lastKnown = week.find((day) => !!day);

  return JSON.parse(lastKnown);
};

const synchronizeEmojis = async () => {
  const today = moment();
  const day = today.format("dddd");
  // don't post on the weekend
  if (FORBIDDEN_DAYS_OF_WEEK.includes(day)) {
    console.log("[SKIP] no posting on the weekend");
    return { today: null, yesterday: null };
  }

  // what emojis are present _right now_?
  const currentEmojis = await getCurrentEmojis();

  // store that list
  const todayKey = today.format("MM-DD-YYYY");
  redis.set(todayKey, JSON.stringify(currentEmojis));

  // what emojis did we have yesterday?
  const yesterdaysEmojis = await getLastKnownEmoji(today.toISOString());

  // return both for processing
  return { today: currentEmojis, yesterday: yesterdaysEmojis };
};

module.exports = {
  synchronizeEmojis: synchronizeEmojis,
};
