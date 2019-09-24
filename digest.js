
const { synchronizeEmojis } = require('./lib/persist');
const { getDifference } = require('./lib/parse');
const { sendDigest, sendRandomEmoji } = require('./lib/msg');

(async () => {
  // get both sets of emojis so we can compare
  const { today, yesterday } = await synchronizeEmojis();

  const difference = getDifference(today, yesterday);
  const newEmojis = Object.keys(difference);

  if (newEmojis.length === 0) {
    return await sendRandomEmoji(today).then(() => process.exit());
  }

  return await sendDigest(newEmojis).then(() => process.exit());
})();
