/* eslint-disable @typescript-eslint/no-unsafe-return */
import axios = require('axios');
import * as tl from 'azure-pipelines-task-lib/task';
import * as qs from 'qs';

export enum HttpMethod {
  get = 'get',
  post = 'post',
  put = 'put',
  delete = 'delete',
  head = 'head',
}

export enum Visibility {
  public = 'public',
  private = 'private',
}
export class Common {
  static async makeRequest(token: string, url: string, payload?: object, method: HttpMethod = HttpMethod.get) {
    tl.debug(`${url}`);
    tl.debug(`${token}`);
    try {
      const result = await axios.default({
        method,
        url,
        data: qs.stringify(payload),
        auth: {
          username: token,
          password: '',
        },
      });
      return result.data;
    } catch (error) {
      tl.debug(`${JSON.stringify(error)}`);
      throw error;
    }
  }
  public static getEndpoint(id: string, type: EndpointType): EndpointData {
    const url = tl.getEndpointUrl(id, false);
    const token = tl.getEndpointAuthorizationParameter(id, 'apitoken', type !== EndpointType.sonarCloud);
    const username = tl.getEndpointAuthorizationParameter(id, 'username', true);
    const password = tl.getEndpointAuthorizationParameter(id, 'password', true);
    const organization = tl.getInput('org', type === EndpointType.sonarCloud);
    return { type, url, token, username, password, organization } as EndpointData;
  }
}

export enum EndpointType {
  sonarCloud = 'SonarCloud',
  sonarQube = 'SonarQube',
}

export interface EndpointData {
  url: string;
  token?: string;
  username?: string;
  password?: string;
  organization?: string;
}
