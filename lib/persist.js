const redis = require('redis').createClient(process.env.REDIS_URL);
const { promisify } = require('util');
const get = promisify(redis.get).bind(redis); // this maps redis.get(key, callback(results)) to a promise-compatible function
const moment = require('moment');
const { getCurrentEmojis } = require('./slack');

const synchronizeEmojis = async () => {
  // what emojis are present _right now_?
  const currentEmojis = await getCurrentEmojis();

  // store that list
  const today = moment();
  const todayKey = today.format('MM-DD-YYYY');
  // redis.set(todayKey, JSON.stringify(currentEmojis));

  // what emojis did we have yesterday?
  const yesterday = moment().subtract(1, 'day');
  const yesterdayKey = yesterday.format('MM-DD-YYYY');
  let yesterdaysEmojis = JSON.parse(await get(yesterdayKey));
  if (Array.isArray(yesterdaysEmojis)) {
    // legacy data, make it an object so we can parse it (even if we lose fidelity)
    yesterdaysEmojis = yesterdaysEmojis.reduce((emojis, emoji) => {
      return {
        ...emojis,
        [emoji]: ''
      }
    }, {});
  }

  // return both for processing
  return { today: currentEmojis, yesterday: yesterdaysEmojis };
}

module.exports = {
  synchronizeEmojis: synchronizeEmojis
}
