import { ApiBase } from './common/apiBase';
import { TaskConfig } from './common/taskConfig';
import { ResponseList } from './commonApi';
import * as tl from 'azure-pipelines-task-lib/task';

export class FeedAPI extends ApiBase {
  constructor(config: TaskConfig) {
    super(config);
  }
  public async findByName({
    org,
    project,
    feedName,
    baseUrl = 'https://feeds.dev.azure.com/',
  }: {
    org: string;
    project?: string;
    feedName: string;
    baseUrl?: string;
  }): Promise<Feed | null> {
    let apiUrl = `${baseUrl}${org}/`;
    if (project != null) {
      apiUrl += `${project}/`;
    }
    apiUrl += `_apis/packaging/feeds`;
    const [status, feeds]: [number, ResponseList<Feed>] = await this.client.get(apiUrl);
    if (status === 200 && feeds.count > 0) {
      return feeds.value.find((x: Feed) => x.name === feedName);
    }
  }

  public async findById({
    org,
    project,
    feedId,
    baseUrl = 'https://feeds.dev.azure.com/',
  }: {
    org: string;
    project?: string;
    feedId: string;
    baseUrl?: string;
  }): Promise<Feed | null> {
    let apiUrl = `${baseUrl}${org}/`;
    if (project != null) {
      apiUrl += `${project}/`;
    }
    apiUrl += `_apis/packaging/feeds`;

    const [status, feeds]: [number, ResponseList<Feed>] = await this.client.get(apiUrl);

    if (status === 200 && feeds.count > 0) {
      return feeds.value.find((x: Feed) => x.id === feedId);
    }
  }
}

export type Feed = {
  name: string;
  id: string;
  description: string;
  isReadOnly: boolean;
  url: string;
  viewName: string;
  viewId: string;
  defaultViewId: string;
};

export const feedApi = new FeedAPI(
  new TaskConfig(tl.getEndpointAuthorizationParameter('SystemVssConnection', 'AccessToken', false)),
);
