const { send } = require('./slack');

const sendDigest = async (newEmojis) => {
  const emojis = newEmojis.map((emoji) => `:${emoji}: — \`:${emoji}:\``).join('\n');
  msg = `There are *${newEmojis.length}* new emojis today! :meow_happy_paws: \n${emojis}`;

  return await send(msg);
}

const sendRandomEmoji = async (emojis) => {
  // if there are no new emojis, give them a random (meow) emoji
  const meow_emojis = Object.keys(emojis).filter((e) => e.includes('meow_'));
  const random = meow_emojis[Math.floor(Math.random()*meow_emojis.length)];
  msg = `There are *no new emojis* to discover today :meow_sad:, but here's one of my favorites: :${random}:`

  return await send(msg);
}

module.exports = {
  sendDigest,
  sendRandomEmoji
}
