const { sendMsg, sendBlocks } = require('./slack');

const aliasBlock = (alias, original) => {
  return {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": `:${alias}: — \`:${alias}:\` (alias for \`:${original}:\`)`
    }
  }
}

const emojiBlock = (emoji, url) => {
  return {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": `:${emoji}: — \`:${emoji}:\``
    },
    "accessory": {
      "type": "image",
      "image_url": url,
      "alt_text": `emoji image for :${emoji}:`
    }
  }
}

const sendDigest = async (newEmojis) => {
  const emojis = Object.keys(newEmojis).map((emoji) => {
    if (newEmojis[emoji].includes('alias:')) {
      const original = newEmojis[emoji].split(':')[1];

      return aliasBlock(emoji, original);
    }

    const url = newEmojis[emoji];
    return emojiBlock(emoji, url);
  }).sort((a, b) => {
    if (!a['accessory'] && b['accessory']) {
      return 1;
    }

    if (a['accessory'] && !b['accessory']) {
      return -1;
    }

    return 0;
  });

  const emojiCount = emojis.filter((block) => block['accessory']).length;
  const aliasCount = emojis.filter((block) => !block['accessory']).length;

  const blocks = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        // <number> new emojis were added today
        "text": `*${emojiCount}* new emoji and *${aliasCount}* new ${(aliasCount > 1 || aliasCount === 0) ? 'aliases' : 'alias'} today! :meow_happy_paws:`
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
