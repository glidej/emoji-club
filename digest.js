const { synchronizeEmojis } = require("./lib/persist");
const { getDifference } = require("./lib/parse");
const { sendDigest, sendRandomEmoji } = require("./lib/msg");

(async () => {
  // get both sets of emojis so we can compare
  const { today, yesterday } = await synchronizeEmojis();

  if (!today || !yesterday) {
    // today doesn't exist when it's a forbidden day (weekends, holidays)
    // yesterday doesn't exist when we search backwards for 30 days and don't find previous emoji
    process.exit();
  }

  const difference = getDifference(today, yesterday);
  const newEmojis = Object.keys(difference);

  if (newEmojis.length === 0) {
    return await sendRandomEmoji(today).then(() => process.exit());
  }

  return await sendDigest(difference).then(() => process.exit());
})();
