import { Common, HttpMethod, Visibility } from './sonarCommon';

export class Projects {
  public static async create(
    name: string,
    org: string | undefined,
    key: string,
    token: string,
    visibility: Visibility = Visibility.public,
    baseUrl: string = 'https://sonarcloud.io/',
  ): Promise<any> {
    const apiUrl = `${baseUrl}api/projects/create?organization=${org}&project=${key}&name=${name}&visibility=${visibility.toLowerCase()}`;
    return await Common.makeRequest(token, apiUrl, undefined, HttpMethod.post);
  }

  public static async delete(
    project: string,
    token: string,
    baseUrl: string = 'https://sonarcloud.io/',
  ): Promise<any> {
    const apiUrl = `${baseUrl}api/projects/delete?project=${project}`;
    return await Common.makeRequest(token, apiUrl, undefined, HttpMethod.post);
  }

  public static async isExist(
    projectName: string,
    org: string | undefined,
    token: string,
    baseUrl: string = 'https://sonarcloud.io/',
  ): Promise<boolean> {
    const apiUrl = `${baseUrl}api/projects/search?organization=${org}&projects=${projectName}&onProvisionedOnly=false`;
    const res = await Common.makeRequest(token, apiUrl);
    return res.components && res.components.length > 0;
  }
}
