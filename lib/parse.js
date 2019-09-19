const getDifference = (current, yesterdays) => {
  if (!current || !yesterdays) { // if either group of emojis don't come back, don't bother trying to parse it.
    return null;
  }

  return Object.keys(current).reduce((difference, emoji) => {
    if (Object.keys(yesterdays).includes(emoji)) {
      return difference;
    }

    return {
      ...difference,
      [emoji]: current[emoji]
    }
  }, {});
}

module.exports = {
  getDifference
}
