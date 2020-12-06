/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import * as tl from 'azure-pipelines-task-lib/task';
import * as sonar_common from './sonarCommon';
import { EndpointType } from './sonarCommon';
import * as sonar_projects from './sonarProjects';

async function createProject() {
  const prgName: string = tl.getInput('name', true) ?? '';
  const prjKey: string = tl.getInput('key', true) ?? prgName;
  const serviceConnection = tl.getInput(EndpointType.sonarCloud, true) ?? '';
  const endpoint = sonar_common.Common.getEndpoint(serviceConnection, EndpointType.sonarCloud);

  tl.debug(`Endpoint: ${JSON.stringify(endpoint)}`);

  const visibility: sonar_common.Visibility =
    (tl.getInput('visibility', false) as sonar_common.Visibility);
  if (endpoint.token === undefined || endpoint.token === '') {
    tl.setResult(tl.TaskResult.Failed, 'No access token was given');
    return;
  }
  const exist = await sonar_projects.Projects.isExist(prjKey, endpoint.organization, endpoint.token, endpoint.url);
  if (!exist) {
    const res = await sonar_projects.Projects.create(
      prgName,
      endpoint.organization,
      prjKey,
      endpoint.token,
      visibility,
      endpoint.url,
    );

    tl.setVariable('SONAR_CREATED_PROJECT_KEY', res.project.key);
    tl.setVariable('SONAR_CREATED_PROJECT_NAME', res.project.name);
    tl.setVariable('SONAR_ORGANIZATION', endpoint.organization ?? '');

    tl.debug(`${JSON.stringify(res)}`);

    tl.setResult(
      tl.TaskResult.Succeeded,
      `Project ${prgName} was created successfully with this key: ${res.project.key}`,
      true,
    );
  } else {
    const msg = `The project ${prgName} already exists`;
    tl.warning(msg);
    tl.setResult(tl.TaskResult.SucceededWithIssues, msg, true);
  }
}

async function deleteProject() {
  const serviceConnection = tl.getInput(EndpointType.sonarCloud, true) ?? '';
  const endpoint = sonar_common.Common.getEndpoint(serviceConnection, EndpointType.sonarCloud);
  tl.debug(`Endpoint: ${JSON.stringify(endpoint)}`);

  const prjKey: string = tl.getInput('key', true) ?? '';
  if (endpoint.token === undefined || endpoint.token === '') {
    tl.error('No access token was given');
    tl.setResult(tl.TaskResult.Failed, 'No access token was given');
    return;
  }

  const exist = await sonar_projects.Projects.isExist(prjKey, endpoint.organization, endpoint.token, endpoint.url);
  if (exist) {
    const res = await sonar_projects.Projects.delete(prjKey, endpoint.token, endpoint.url);
    tl.debug(res);
    tl.setResult(tl.TaskResult.Succeeded, `Project ${prjKey} was deleted successfully`, true);
  } else {
    tl.error(`No project found with key ${prjKey}`);
  }
}

const actionsMap: Map<string, () => Promise<void>> = new Map([
  ['create', createProject],
  ['delete', deleteProject],
]);

async function run() {
  try {
    const action: string = tl.getInput('action', true) ?? 'create';
    const actionDelegate = actionsMap.get(action.toLowerCase());
    if (actionDelegate !== undefined) {
      await actionDelegate();
    }
  } catch (err) {
    tl.debug(err.message);
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();
