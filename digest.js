// slack dependencies
const { IncomingWebhook } = require("@slack/webhook");
const { WebClient } = require('@slack/web-api');
const url = process.env.SLACK_WEBHOOK_URL;
const token = process.env.SLACK_TOKEN;
const slack_web = new WebClient(token);
const slack_webhook = new IncomingWebhook(url);

// redis dependencies
const redis = require('redis').createClient(process.env.REDIS_URL);
const { promisify } = require('util');
const get = promisify(redis.get).bind(redis); // this maps redis.get(key, callback(results)) to a promise-compatible function
const moment = require('moment');

const getEmojisForDate = async (key) => {
  const response = await get(key);

  return JSON.parse(response);
}

const getNewEmojis = (current, yesterdays) => {
  if (!current || !yesterdays) { // if either group of emojis don't come back, don't bother trying to parse it.
    return [];
  }

  return current.filter((emoji) => {
    // filter the emojis down to just the new ones by comparing the current list to yesterdays list
    return yesterdays.indexOf(emoji) == -1;
  })
}

const sendDigest = async (oldEmojis, newEmojis) => {
  let msg = '';

  if (newEmojis.length === 0) {
    // if there are no new emojis, give them a random (meow) emoji
    const meow_emojis = oldEmojis.filter((e) => e.includes('meow_'));
    const random = meow_emojis[Math.floor(Math.random()*meow_emojis.length)];
    msg = `There are *no new emojis* to discover today :meow_sad:, but here's one of my favorites: :${random}:`
  } else {
    const emojis = newEmojis.map((emoji) => `:${emoji}:`).join(' ');
    msg = `There are *${newEmojis.length}* new emojis today! :meow_happy_paws:
${emojis}`;
  }

  await slack_webhook.send({
    text: msg
  });
}

(async () => {
  const today = moment();
  const yesterday = moment().subtract(1, 'day');

  const slack_response = await slack_web.apiCall("emoji.list");
  // slack returns emojis as an object, { 'meow_json': 'url_to_image_asset' }
  // we only really need the object keys
  const currentEmojis = Object.keys(slack_response.emoji);
  const yesterdaysEmojis = await getEmojisForDate(yesterday.format('MM-DD-YYYY'));

  // create a "key" based on the date to store todays emoji list under, ex: '09-13-2019: [ meow_array, meow_string, meow_object ]
  const key = today.format('MM-DD-YYYY');
  redis.set(key, JSON.stringify(currentEmojis));

  const newEmojis = getNewEmojis(currentEmojis, yesterdaysEmojis);

  await sendDigest(currentEmojis, newEmojis);

  process.exit();
})();
