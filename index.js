// This is the main file for the Developer Assistant bot.
// Import Botkit's core features
const { Botkit } = require('botkit');
const luis = require('botkit-middleware-luis');

// Import a platform-specific adapter for slack.
const { SlackAdapter, SlackMessageTypeMiddleware, SlackEventMiddleware } = require('botbuilder-adapter-slack');

// Load process.env values from .env file
require('dotenv').config();

const azureDevops = require('./lib/azuredevops');
const log = require('./lib/log');

const adapter = new SlackAdapter({
  // REMOVE THIS OPTION AFTER YOU HAVE CONFIGURED YOUR APP!
  enable_incomplete: false,

  // parameters used to secure webhook endpoint
  verificationToken: process.env.VERIFICATION_TOKEN,
  clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,

  // auth token for a single-team app
  botToken: process.env.BOT_TOKEN,

  // credentials used to set up oauth for multi-team apps
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  scopes: ['bot'],
  redirectUri: process.env.REDIRECT_URI,
});

// Use SlackEventMiddleware to emit events that match their original Slack event types.
adapter.use(new SlackEventMiddleware());

// Use SlackMessageType middleware to further classify messages as direct_message,
// direct_mention, or mention
adapter.use(new SlackMessageTypeMiddleware());

const controller = new Botkit({
  webhook_uri: '/api/messages',
  adapter,
});

const luisOptions = { serviceUri: process.env.LUIS_SERVICE_URI };
controller.middleware.receive.use(luis.middleware.receive(luisOptions));

const ReportWorkHours = 'ReportWorkHours';

// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {
  controller.hears('.*', 'message,direct_message', async (bot, message) => {
    azureDevops.queryTasksInProgress(async (err, tasks) => {
      log.info(`message: ${message.text} intent: ${message.topIntent.intent} score: ${message.topIntent.score}`);
      await bot.changeContext(message.reference);
      if (message.topIntent && message.topIntent.intent
        && message.topIntent.intent === ReportWorkHours
        && message.topIntent.score > 0.7) {
        if (!err) {
          if (tasks.length === 0) {
            await bot.reply(message, 'I don\'t have any stories in progress');
          } else {
            let messageToSend = '';
            tasks.forEach((task) => {
              messageToSend += `${task.title} (${task.id}) (${task.state}) (${task.changedDate.toISOString().slice(0, 10)})\n`;
            });
            await bot.reply(message, messageToSend);
          }
        } else {
          log.error(`An error occurred while trying to retrieve task information from azure. ${err}`);
        }
      } else {
        await bot.reply(message, 'Sorry, I did not understand your question. Please try again.');
      }
    });
  });
});

controller.webserver.get('/', (req, res) => {
  res.send(`This app is running Botkit ${controller.version}.`);
});
