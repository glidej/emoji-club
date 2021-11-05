const {
  getLastKnownEmoji,
  storeEmojiDiff,
  storeEmojiList,
  getRandomMeow,
  getEmojiAnniversaries,
} = require("./lib/persist");
const { getDifference } = require("./lib/parse");
const { getCurrentEmojis } = require("./lib/slack");
const { sendDigest } = require("./lib/msg");
const moment = require("moment");

const FORBIDDEN_DAYS_OF_WEEK = ["Saturday", "Sunday"];

(async () => {
  const today = moment();
  const day = today.format("dddd");
  // don't post on the weekend
  if (FORBIDDEN_DAYS_OF_WEEK.includes(day)) {
    console.log("[SKIP] no posting on the weekend");
    process.exit();
  }

  // get the last stored emoji from redis under `last_known`
  const last_known = await getLastKnownEmoji();

  // get the latest emoji from slack
  const latest = await getCurrentEmojis();

  // diff those lists
  const difference = getDifference(latest, last_known);

  // store the diff under the current timestamp
  await storeEmojiDiff(difference);

  // store the latest emoji list from slack to redis under `last_known`
  await storeEmojiList(latest);

  // look up emoji anniversaries (today minus 1 year)
  const anniversaries = await getEmojiAnniversaries();

  // if the new emoji diff is 0, look up a random `meow_` emoji from `last_known` key
  let randomEmoji;
  if (Object.keys(difference).length === 0) {
    randomEmoji = await getRandomMeow();
  }

  return await sendDigest(difference, anniversaries, randomEmoji).then(() => {
    console.log(
      `[DIGEST] emoji for ${today.format("dddd, MMMM Do")} posted successfully.`
    );
    process.exit();
  });
})();
