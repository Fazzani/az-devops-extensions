import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { TaskConfig } from './taskConfig';
import * as tl from 'azure-pipelines-task-lib/task';

export abstract class ApiBase {
  protected readonly client: AxiosInstance;
  protected readonly taskConfig: TaskConfig;
  constructor(config: TaskConfig) {
    this.taskConfig = config;
    this.client = axios.create({
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
      },
    });
    this.initializeResponseInterceptor();
  }

  private initializeResponseInterceptor = () => {
    this.client.interceptors.response.use(this.handleResponse, this.handleError);
    this.client.interceptors.request.use(this.handleRequest, this.handleError);
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  private handleResponse = ({ status, data }: AxiosResponse): any => [status, data];
  private handleRequest = (config: AxiosRequestConfig) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    config.params =
      config.params === undefined
        ? { 'api-version': this.taskConfig.azDevopsApiVersion }
        : { ...config.params, 'api-version': this.taskConfig.azDevopsApiVersion };
    config.auth = {
      username: this.taskConfig.pat,
      password: '',
    };
    return config;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  protected handleError = (error: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    tl.debug(JSON.stringify(error));
    return Promise.reject(error);
  };
}
