import { Common } from './common';
import { ResponseList } from './commonApi';

export class FeedAPI {
  public static async findByName({
    org,
    project,
    pat,
    feedName,
    baseUrl = 'https://feeds.dev.azure.com/',
    apiVersion = '?api-version=5.0-preview.1',
  }: {
    org: string;
    project?: string;
    pat: string;
    feedName: string;
    baseUrl?: string;
    apiVersion?: string;
  }): Promise<Feed | null> {
    let apiUrl = `${baseUrl}${org}/`;
    if (project != null) {
      apiUrl += `${project}/`;
    }
    apiUrl += `_apis/packaging/feeds${apiVersion}`;
    const [status, feeds]: [number, ResponseList<Feed>] = await Common.makeRequest({ token: pat, url: apiUrl });
    if (status === 200 && feeds.count > 0) {
      return feeds.value.find((x: Feed) => x.name === feedName) ;
    }
  }

  public static async findById({
    org,
    project,
    pat,
    feedId,
    baseUrl = 'https://feeds.dev.azure.com/',
    apiVersion = '?api-version=5.0-preview.1',
  }: {
    org: string;
    project?: string;
    pat: string;
    feedId: string;
    baseUrl?: string;
    apiVersion?: string;
  }): Promise<Feed | null> {
    let apiUrl = `${baseUrl}${org}/`;
    if (project != null) {
      apiUrl += `${project}/`;
    }
    apiUrl += `_apis/packaging/feeds${apiVersion}`;
    const [status, feeds]: [number, ResponseList<Feed>] = await Common.makeRequest({ token: pat, url: apiUrl });
    if (status === 200 && feeds.count > 0) {
      return feeds.value.find((x: Feed) => x.id === feedId) ;
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
