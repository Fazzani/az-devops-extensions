import axios = require('axios');
import * as tl from 'azure-pipelines-task-lib/task';
import * as qs from 'qs';

export enum HttpMethod {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Delete = 'delete',
  Head = 'head',
  PATCH = 'patch',
}

export class Common {
  static async makeRequest({
    token,
    url,
    payload,
    params,
    method = HttpMethod.Get,
    stringifyData = true,
  }: {
    token: string;
    url: string;
    payload?: object;
    params?: object;
    method?: HttpMethod;
    stringifyData?: boolean;
  }): Promise<[number, any]> {
    tl.debug(`${url}`);
    try {
      let data: string | object = payload;
      if (payload === null && stringifyData) data = qs.stringify(payload);

      const result = await axios.default({
        method,
        url,
        data,
        params,
        auth: {
          username: token,
          password: '',
        },
      });
      return [(result as axios.AxiosResponse).status, result.data];
    } catch (error) {
      tl.debug(`${JSON.stringify(error)}`);
      throw error;
    }
  }
}
