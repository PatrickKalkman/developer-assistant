const log = require('./lib/log');

require('dotenv').config();

const azureDevops = require('./lib/azuredevops');

azureDevops.queryTasksInProgress((err, tasks) => {
  if (!err) {
    if (tasks.length === 0) {
      log.info('No tasks in progress.....');
    }
    tasks.forEach((task) => {
      log.info(`${task.title} (${task.id}) (${task.state}) (${task.changedDate.toISOString().slice(0, 10)})`);
    });
  }
});
