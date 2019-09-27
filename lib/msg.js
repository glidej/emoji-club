const { sendMsg, sendBlocks } = require('./slack');

const sendDigest = async (newEmojis) => {
  const emojis = Object.keys(newEmojis).map((emoji) => {
    if (newEmojis[emoji].includes('alias:')) {
      return {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `:${emoji}: — \`:${emoji}:\` (alias for \`:${newEmojis[emoji].split(':')[1]}:\`)`
        }
      }
    }

    return {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `:${emoji}: — \`:${emoji}:\``
      },
      "accessory": {
        "type": "image",
        "image_url": newEmojis[emoji],
        "alt_text": `emoji image for :${emoji}:`
      }
    }
  }).sort((a, b) => {
    if (!a['accessory'] && b['accessory']) {
      return 1;
    }

    if (a['accessory'] && !b['accessory']) {
      return -1;
    }

    return 0;
  });

  const blocks = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `There are *${Object.keys(newEmojis).length}* new emojis today! :meow_happy_paws:`
      }
    },
    ...emojis
  ];

  return await sendBlocks(blocks);
}

const sendRandomEmoji = async (emojis) => {
  // if there are no new emojis, give them a random (meow) emoji
  const meow_emojis = Object.keys(emojis).filter((e) => e.includes('meow_'));
  const random = meow_emojis[Math.floor(Math.random()*meow_emojis.length)];
  msg = `There are *no new emojis* to discover today :meow_sad:, but here's one of my favorites: :${random}:`

  return await sendMsg(msg);
}

module.exports = {
  sendDigest,
  sendRandomEmoji
}
