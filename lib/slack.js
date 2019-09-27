
const { WebClient } = require('@slack/web-api');
const token = process.env.SLACK_TOKEN;
const slack_web = new WebClient(token);

const { IncomingWebhook } = require("@slack/webhook");
const url = process.env.SLACK_WEBHOOK_URL;
const slack_webhook = new IncomingWebhook(url);

const getCurrentEmojis = async () => {
  return await slack_web.apiCall("emoji.list").then((response) => {
    if (!response.ok) {
      return [];
    }

    return response.emoji;
  });
}

const sendBlocks = async (blocks) => {
  return await slack_webhook.send({
    "blocks": blocks
  }).catch((err) => console.log(err));
}

const sendMsg = async (msg) => {
  return await slack_webhook.send({
    text: msg
  })
}

module.exports = {
  getCurrentEmojis,
  sendBlocks,
  sendMsg
}
