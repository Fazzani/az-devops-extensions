import { Common } from './common';

export class FeedAPI {
  public static async findByName(
    org: string | undefined,
    project: string | undefined,
    pat: string,
    feedName: string,
    baseUrl: string = 'https://feeds.dev.azure.com/',
    apiVersion: string = '?api-version=5.0-preview.1',
  ): Promise<Feed | undefined> {
    let apiUrl = `${baseUrl}${org}/`;
    if (project !== undefined && project !== null) {
      apiUrl += `${project}/`;
    }
    apiUrl += `_apis/packaging/feeds${apiVersion}`;
    const [, feeds]: [number, any] = await Common.makeRequest(pat, apiUrl);
    if (feeds.count > 0) {
      return feeds.value.find((x: Feed) => x.name === feedName) as Feed;
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
