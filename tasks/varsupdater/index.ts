/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
import * as tl from 'azure-pipelines-task-lib/task';
import { releaseVarsApi } from './releaseVars';

const run = async (): Promise<void> => {
  try {
    const option = readInputs();
    tl.debug(`Inputs: ${JSON.stringify(option)}`);

    const [valid, errors] = validateInputs(option);
    if (!valid) {
      errors.forEach(tl.error);
      tl.setResult(tl.TaskResult.Failed, 'Invalid inputs');
      return;
    }
    if (
      await releaseVarsApi.update(
        option.value,
        option.releaseVariableName,
        option.releaseId,
        option.releaseEnvId,
        option.teamProject,
        option.vssUrl,
      )
    )
      tl.setResult(tl.TaskResult.Succeeded, `Variable release ${option.releaseVariableName} updated successfully`);
    else tl.setResult(tl.TaskResult.Failed, 'Variable not updated for unknown reason. Please check log above');
  } catch ({ message }) {
    tl.debug(message);
    tl.setResult(tl.TaskResult.Failed, message);
  }
};

const validateInputs = (option: Option): [boolean, string[]] => {
  let valid = true;
  const errors: string[] = [];
  if (option.accessToken === '') {
    valid = false;
    errors.push("Invalid accessToken: can't be empty");
  }
  if (option.vssUrl === '') {
    valid = false;
    errors.push("Invalid vssUrl: can't be empty");
  }
  return [valid, errors];
};

// export function getSystemAccessToken(): string {
//   tl.debug('Getting credentials for local feeds');
//   const auth = tl.getEndpointAuthorization('SYSTEMVSSCONNECTION', false);
//   if (auth.scheme === 'OAuth') {
//     tl.debug('Got auth token');
//     return auth.parameters['AccessToken'];
//   } else {
//     tl.warning('Could not determine credentials to use');
//   }
// }

const readInputs = (): Option => {
  const option: Option = new Option();

  option.releaseEnvId = Number(tl.getVariable('release.environmentId'));
  option.releaseVariableName = tl.getInput('rel_var', true);
  option.value = tl.getInput('var_val', true);
  option.vssUrl = tl.getVariable('System.CollectionUri');
  option.accessToken = tl.getVariable('System.AccessToken');
  option.releaseId = tl.getVariable('Release.ReleaseId');
  option.teamProject = tl.getVariable('system.TeamProject');
  return option;
};

class Option {
  releaseEnvId: number;
  releaseVariableName: string;
  releaseId: string;
  value: string;
  vssUrl: string;
  accessToken: string;
  teamProject: string;
}

void run();
