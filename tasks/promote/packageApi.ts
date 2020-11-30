/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { JsonPatchOperation, JsonPatchOperationTypeEnum, ResponseList } from './commonApi';
import * as tl from 'azure-pipelines-task-lib/task';
import * as admzip from 'adm-zip';
import * as parser from 'fast-xml-parser';
import * as fs from 'fs';
import path = require('path');
import { ApiBase } from './common/apiBase';
import { TaskConfig } from './common/taskConfig';
import { feedApi } from './feedApi';

type CallbackFunctionVariadic = (...args: any[]) => PackageResult;

export class PackageAPI extends ApiBase {
  constructor(config: TaskConfig) {
    super(config);
  }

  public getInfo({ filePath, type = ProtocolType.nuGet }: { filePath: string; type?: ProtocolType }): PackageResult {
    switch (type) {
      case ProtocolType.nuGet:
        return this.extractPackages(filePath, PackageAPI.nuspecReader);
      case ProtocolType.npm:
        return this.extractPackages(filePath, PackageAPI.npmReader);
      default:
        tl.warning(`not supported type ${type}`);
        break;
    }
    return null;
  }

  public static nuspecReader(fileData: string): PackageResult {
    if (!!parser.validate(fileData)) {
      const jsonObj: any = parser.parse(fileData);
      tl.debug(`NuspecReader: ${JSON.stringify(jsonObj)}`);
      return { name: jsonObj.package.metadata.id, version: jsonObj.package.metadata.version } as PackageResult;
    }
  }

  public static npmReader(fileData: string): PackageResult {
    if (fileData == null) new Error('not allowed value: fileData is null');
    const jsonObj: any = JSON.parse(fileData);
    tl.debug(`NpmReader: ${JSON.stringify(jsonObj)}`);
    return jsonObj as PackageResult;
  }

  public extractPackages(filePath: string, reader: CallbackFunctionVariadic): PackageResult {
    try {
      const ext = path.extname(filePath);
      switch (ext) {
        case '.nupkg':
        case '.zip':
          const zipEntries = new admzip(filePath)
            .getEntries()
            .filter((e) => !e.isDirectory && e.name.endsWith('nuspec'));
          if (zipEntries !== null && zipEntries.length > 0) {
            return reader(zipEntries[0].getData().toString('utf-8'));
          }
          break;
        case '.json':
          const content = fs.readFileSync(filePath, { encoding: 'utf8' });
          return reader(content);
        default:
          tl.debug(`Not supported extension ${ext}`);
      }
    } catch (err) {
      tl.warning(`${JSON.stringify(err)}`);
    }
    return null;
  }

  public async promote({
    org,
    project,
    feedId,
    packageName,
    packageVersion,
    packageType = ProtocolType.nuGet,
    viewId = 'Prerelease',
    operation = JsonPatchOperationTypeEnum.add,
    baseUrl = 'https://pkgs.dev.azure.com/',
  }: {
    org: string;
    project?: string;
    feedId: string;
    packageName: string;
    packageVersion: string;
    packageType?: ProtocolType;
    viewId?: string;
    operation?: JsonPatchOperationTypeEnum;
    baseUrl?: string;
  }): Promise<boolean> {
    const feed = await feedApi.findById({ org, project, feedId });
    if (feed == null) {
      tl.error(`Feed ${feedId} not found`);
      return false;
    }
    const pkg = await this.getVersionByName({
      org,
      project,
      feedName: feed.name,
      packageName,
      packageVersion,
      packageType,
    });
    if (pkg == null) {
      tl.warning(`Package not found ${packageName}`);
      return false;
    }
    if (pkg != null) {
      let apiUrl = `${baseUrl}${org}/`;
      if (project != null) {
        apiUrl += `${project}/`;
      }
      apiUrl += `_apis/packaging/feeds/${
        feed.name
      }/${packageType.toLocaleLowerCase()}/packages/${packageName}/versions/${packageVersion}`;
      const payload: any = { views: { op: operation, path: '/views/-', value: `${viewId}` } as JsonPatchOperation };
      const [status]: [number] = await this.client.patch(apiUrl, payload);
      return status <= 202;
    }
  }

  public async getVersionByName({
    org,
    project,
    feedName,
    packageName,
    packageVersion,
    packageType = ProtocolType.nuGet,
    baseUrl = 'https://pkgs.dev.azure.com/',
  }: {
    org: string;
    project?: string;
    feedName: string;
    packageName: string;
    packageVersion: string;
    packageType?: ProtocolType;
    baseUrl?: string;
  }): Promise<Package> {
    try {
      let apiUrl = `${baseUrl}${org}/`;
      if (project != null) {
        apiUrl += `${project}/`;
      }
      apiUrl += `_apis/packaging/feeds/${feedName}/${packageType.toLowerCase()}/packages/${packageName.toLocaleLowerCase()}/versions/${packageVersion}`;
      const [, pkg]: [number, Package] = await this.client.get(apiUrl);
      return pkg;
    } catch (error) {
      if (error.response.status === 404) {
        tl.debug(`Package ${packageName} with version ${packageVersion} not found`);
        return null;
      }
    }
  }

  public async getVersionById({
    org,
    project,
    feedId,
    packageId,
    packageVersionId,
    packageType = ProtocolType.nuGet,
    baseUrl = 'https://pkgs.dev.azure.com/',
  }: {
    org: string;
    project?: string;
    feedId: string;
    packageId: string;
    packageVersionId: string;
    packageType?: ProtocolType;
    baseUrl?: string;
  }): Promise<PackageVersion> {
    try {
      let apiUrl = `${baseUrl}${org}/`;
      if (project != null) {
        apiUrl += `${project}/`;
      }
      apiUrl += `_apis/packaging/feeds/${feedId}/${packageType.toLowerCase()}/packages/${packageId}/versions/${packageVersionId}`;

      const [, pkg]: [number, PackageVersion] = await this.client.get(apiUrl);
      return pkg;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        tl.warning(`Package ${packageId} with version ${packageVersionId} not found`);
        return null;
      }
    }
  }

  public async get({
    org,
    project,
    feedId,
    packageId,
    includeAllVersions = false,
    includeDeleted = false,
    includeDescription = true,
    includeUrls = false,
    isListed = true,
    isRelease = true,
    baseUrl = 'https://feeds.dev.azure.com/',
  }: {
    org: string;
    project?: string;
    feedId: string;
    packageId: string;
    includeAllVersions?: boolean;
    includeDeleted?: boolean;
    includeDescription?: boolean;
    includeUrls?: boolean;
    isListed?: boolean;
    isRelease?: boolean;
    baseUrl?: string;
  }): Promise<ResponseList<Package>> {
    try {
      let apiUrl = `${baseUrl}${org}/`;
      if (project != null) {
        apiUrl += `${project}/`;
      }
      apiUrl += `_apis/packaging/feeds/${feedId}/packages/${packageId}/versions`;
      const [, pkgs]: [number, ResponseList<Package>] = await this.client.get(apiUrl, {
        params: {
          includeAllVersions,
          includeDeleted,
          includeDescription,
          includeUrls,
          isListed,
          isRelease,
        },
      });
      return pkgs;
    } catch (error) {
      if (error.response.status === 404) {
        tl.warning(`Package ${packageId} not found`);
        return null;
      }
    }
  }

  public async list({
    org,
    project,
    feedId,
    top,
    skip,
    packageNameQuery,
    baseUrl = 'https://feeds.dev.azure.com/',
  }: {
    org: string;
    project?: string;
    feedId: string;
    top: number;
    skip: number;
    packageNameQuery: string;
    baseUrl?: string;
  }): Promise<ResponseList<Package>> {
    let apiUrl = `${baseUrl}${org}/`;
    if (project != null) {
      apiUrl += `${project}/`;
    }
    apiUrl += `_apis/packaging/feeds/${feedId}/packages`;
    const [, pkgs]: [number, ResponseList<Package>] = await this.client.get(apiUrl, {
      params: {
        packageNameQuery,
        skip,
        top,
      },
    });
    return pkgs;
  }

  public async findByName({
    org,
    project,
    feedId,
    packageName,
  }: {
    org: string;
    project?: string;
    feedId: string;
    packageName: string;
  }): Promise<Package> {
    const pkgs = await this.list({
      org,
      project,
      feedId,
      top: 1,
      skip: 0,
      packageNameQuery: packageName,
    });
    if (pkgs.count > 0) return pkgs.value[0];
    return null;
  }
}

export enum ProtocolType {
  npm = 'Npm',
  nuGet = 'NuGet',
  maven = 'Maven',
  pypi = 'PyPi',
  universal = 'Upack',
}

export interface Package {
  id: string;
  name: string;
  author: string;
  deletedDate?: string;
  permanentlyDeletedDate?: string;
  version?: string;
  _links: any;
  sourceChain: any;
  isCached?: boolean;
  versions?: MinimalPackageVersion[];
  protocolType?: ProtocolType;
}

export interface MinimalPackageVersion {
  id: string;
  directUpstreamSourceId: string;
  normalizedVersion: string;
  packageDescription: string;
  publishDate: string;
  storageId: string;
  version: string;
  views: FeedView[];
  isCachedVersion: boolean;
  isDeleted: boolean;
  isLatest: boolean;
  isListed: boolean;
}

export interface FeedView {
  id: string;
  name: string;
  url: string;
  visibility: FeedVisibility;
  type: FeedViewType;
}

// eslint-disable-next-line no-shadow
export enum FeedViewType {
  implicit = 'implicit',
  none = 'none',
  release = 'release',
}

// eslint-disable-next-line no-shadow
export enum FeedVisibility {
  aadTenant = 'aadTenant',
  collection = 'collection',
  organization = 'organization',
  private = 'private',
}

export interface PackageVersion {
  _links: any;
  author: string;
  deletedDate: string;
  dependencies: any[];
  description: string;
  directUpstreamSourceId: string;
  files: any[];
  id: string;
  isCachedVersion: boolean;
  isDeleted: boolean;
  isLatest: boolean;
  isListed: boolean;
  normalizedVersion: string;
  otherVersions: MinimalPackageVersion[];
  packageDescription: string;
  protocolMetadata: any;
  publishDate: string;
  sourceChain: any[];
  storageId: string;
  summary: string;
  tags: string[];
  url: string;
  version: string;
  views: FeedView[];
}

export interface PackageResult {
  name: string;
  version: string;
}

export const packageApi = new PackageAPI(
  new TaskConfig(tl.getEndpointAuthorizationParameter('SystemVssConnection', 'AccessToken', false)),
);
