const getDifference = (now, known = {}) => {
  if (!now) {
    // if either group of emojis don't come back, don't bother trying to parse it.
    return null;
  }

  return Object.keys(now).reduce((difference, emoji) => {
    if (Object.keys(known).includes(emoji)) {
      return difference;
    }

    return {
      ...difference,
      [emoji]: now[emoji],
    };
  }, {});
};

module.exports = {
  getDifference,
};
