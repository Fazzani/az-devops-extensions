/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ApiBase } from './common/apiBase';
import { TaskConfig } from './common/taskConfig';
import * as tl from 'azure-pipelines-task-lib/task';

export class ReleaseVarsAPI extends ApiBase {
  constructor(config: TaskConfig) {
    super(config);
  }

  public async update(
    varValue: string,
    relValue: string,
    releaseId: string,
    envId: number,
    project: string,
    baseUrl = 'https://vsrm.dev.azure.com/',
  ): Promise<boolean> {
    let baseApiUrl = `${baseUrl}`;
    if (project != null) {
      baseApiUrl += `${project}/`;
    }
    const apiGetUrl = `${baseApiUrl}_apis/release/definitions/${releaseId}`;
    const [status, releaseDefinition]: [number, any] = await this.client.get(apiGetUrl);
    if (status !== 200) return false;
    // todo: check releaseDefinition.variables[relValue].allowOverride
    if (releaseDefinition.variables[relValue] === undefined) {
      const env = releaseDefinition.environments.find((x) => x.id === envId);
      if (env !== undefined && env.variables[relValue] !== undefined) {
        // update release variables env scoped
        env.variables[relValue].value = varValue;
      } else {
        tl.warning(`The new variable ${relValue} will be created`);
        releaseDefinition.variables[relValue] = { value: varValue };
      }
    } else {
      releaseDefinition.variables[relValue].value = varValue;
    }
    const apiPutUrl = `${baseApiUrl}_apis/release/definitions`;
    const [statusUpdate]: [number, any] = await this.client.put(apiPutUrl, releaseDefinition);
    if (statusUpdate !== 200) {
      tl.error(`Can't update release ${releaseId}`);
      return false;
    }
    return true;
  }
}

export const releaseVarsApi = new ReleaseVarsAPI(new TaskConfig(tl.getVariable('System.AccessToken')));
