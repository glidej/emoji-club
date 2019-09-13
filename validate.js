if (!process.env.SLACK_WEBHOOK_URL) {
  console.log('SLACK_WEBHOOK_URL is missing');
}

if (!process.env.SLACK_TOKEN) {
  console.log('SLACK_TOKEN is missing');
}

if (!process.env.REDIS_URL) {
  console.log('REDIS_URL is missing');
}
