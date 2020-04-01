/*
 * Encoder Engine
 */

// Dependencies
const azdev = require('azure-devops-node-api');
const log = require('./log');

const lib = {};

const authHandler = azdev.getPersonalAccessTokenHandler(process.env.AZURE_PERSONAL_ACCESS_TOKEN);
const connection = new azdev.WebApi(process.env.AZURE_COLLECTION_URL, authHandler);

// const teamContext = {
//   project: process.env.AZURE_PROJECT,
//   projectId: process.env.AZURE_PROJECT_ID,
//   team: process.env.AZURE_TEAM,
//   teamId: process.env.AZURE_TEAM_ID,
// };

lib.queryTasksInProgress = function queryTasksInProgress(cb) {
  connection.getWorkItemTrackingApi().then(
    (workItemApi) => {
      workItemApi.getAccountMyWorkData(1).then(
        (myWorkResult) => {
          const result = myWorkResult.workItemDetails.filter(
            (wi) => (wi.workItemType === 'Task' || wi.workItemType === 'User Story') && (wi.state === 'Done' || wi.state === 'In Progress'),
          );
          cb(false, result);
        },
        (errData) => {
          log.error(`An error occurred while trying to retrieve work item data. ${errData}`);
          cb(errData, false);
        },
      );
    },
    (errApi) => {
      log.err(`An error occurred while trying to retrieving the work item tracking API. ${errApi}`);
      cb(errApi, false);
    },
  );
};

module.exports = lib;
