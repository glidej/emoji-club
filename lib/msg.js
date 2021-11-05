const { sendMsg, sendBlocks } = require("./slack");

const chunk = (arr, len) => {
  var chunks = [],
    i = 0,
    n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, (i += len)));
  }

  return chunks;
};

const aliasBlock = (alias, original) => {
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `:${alias}: — \`:${alias}:\` (alias for \`:${original}:\`)`,
    },
  };
};

const emojiBlock = (emoji, url) => {
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `:${emoji}: — \`:${emoji}:\``,
    },
    accessory: {
      type: "image",
      image_url: url,
      alt_text: `emoji image for :${emoji}:`,
    },
  };
};

const buildBlocks = (newEmoji) => {
  return Object.keys(newEmoji)
    .map((emoji) => {
      if (newEmoji[emoji].includes("alias:")) {
        const original = newEmoji[emoji].split(":")[1];

        return aliasBlock(emoji, original);
      }

      const url = newEmoji[emoji];
      return emojiBlock(emoji, url);
    })
    .sort((a, b) => {
      if (!a["accessory"] && b["accessory"]) {
        return 1;
      }

      if (a["accessory"] && !b["accessory"]) {
        return -1;
      }

      return 0;
    });
};

const buildEmojiAnnouncement = (emoji) => {
  const emojiCount = emoji.filter((block) =>
    block.hasOwnProperty("accessory")
  ).length;
  const emojiText =
    emojiCount > 0 ? `*${emojiCount}* new emoji` : `No new emoji`;

  const aliasCount = emoji.filter(
    (block) => !block.hasOwnProperty("accessory")
  ).length;
  const aliasText =
    aliasCount > 0
      ? `and *${aliasCount}* new ${aliasCount > 1 ? "aliases" : "alias"} `
      : "";

  const reaction =
    !emojiCount && !aliasCount ? `:meow_okay:` : `:meow_happy_paws:`;

  return `${emojiText} ${aliasText}today. ${reaction}`;
};

const buildEmojiAnniversaries = (emoji) => {
  const emojiCount = emoji.length;

  if (emojiCount === 0) {
    return `No emoji anniversaries to celebrate today :meow_vvsad:`;
  }

  return `*${emojiCount}* emoji are celebrating their *1* year anniversary today! :labsiversary:`;
};

const sendDigest = async (newEmojis, anniversaries, randomEmoji) => {
  const newEmojiBlocks = buildBlocks(newEmojis);
  const anniversaryEmojiBlocks = buildBlocks(anniversaries);

  if (!newEmojiBlocks.length && !anniversaryEmojiBlocks.length) {
    return await sendRandomEmoji(randomEmoji);
  }

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: buildEmojiAnnouncement(newEmojiBlocks),
      },
    },
    ...newEmojiBlocks,

    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: buildEmojiAnniversaries(anniversaryEmojiBlocks),
      },
    },
    ...anniversaryEmojiBlocks,
  ];

  const chunks = chunk(blocks, 49);

  const batch = async (chunks) => {
    for (const chunk of chunks) {
      await sendBlocks(chunk);
    }
  };

  return await batch(chunks);
};

const sendRandomEmoji = async (randomEmoji) => {
  // if there are no new emojis, give them a random (meow) emoji
  // const meow_emojis = Object.keys(emojis).filter((e) => e.includes("meow_"));
  // const random = meow_emojis[Math.floor(Math.random() * meow_emojis.length)];
  const msg = `There are *no new emojis* to discover today :meow_sad:, but here's one of my favorites: :${randomEmoji}:`;

  return await sendMsg(msg);
};

module.exports = {
  sendDigest,
  sendRandomEmoji,
};
