import { JsonPatchOperation, JsonPatchOperationTypeEnum, ResponseList } from './commonApi';
import * as tl from 'azure-pipelines-task-lib/task';
import * as parser from 'fast-xml-parser';
import path = require('path');
import { ApiBase } from './common/apiBase';
import { TaskConfig } from './common/taskConfig';
import { feedApi } from './feedApi';
import * as decompress from 'decompress';

type CallbackFunctionVariadic = (...args: any[]) => PackageResult;

export class PackageAPI extends ApiBase {
  constructor(config: TaskConfig) {
    super(config);
  }

  /**
   * Get package info from files
   *
   * @param param0 option
   */
  public async getInfo({
    filePath,
    type = ProtocolType.nuGet,
  }: {
    filePath: string;
    type?: ProtocolType;
  }): Promise<PackageResult> {
    switch (type) {
      case ProtocolType.nuGet:
        return await this.extractPackages(
          filePath,
          (file) => path.extname(file.path) === '.nuspec',
          PackageAPI.nuspecReader,
        );
      case ProtocolType.npm:
        return await this.extractPackages(
          filePath,
          (file) => path.basename(file.path) === 'package.json',
          PackageAPI.npmReader,
        );
      case ProtocolType.pypi:
        return await this.extractPackages(
          filePath,
          (file) => path.basename(file.path) === 'setup.py',
          PackageAPI.pipyReader,
        );
      default:
        tl.warning(`not supported type ${type}`);
        break;
    }
    return null;
  }

  public static pipyReader(fileData: string): PackageResult {
    if (fileData == null) new Error('Not allowed value: fileData is null');
    const content = fileData.toString();
    // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
    const nameMatched = content.match(/name='(.*)',/m);
    if (nameMatched.length > 1) {
      // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
      const versionMatched = content.match(/version='(.*)',/m);
      if (versionMatched.length > 1) {
        return { name: nameMatched[1], version: versionMatched[1] };
      } else {
        new Error("Couldn't matching pipy version");
      }
    }
  }

  /**
   * Nuspec file reader
   *
   * @static
   * @param {string} fileData
   * @returns {PackageResult}
   * @memberof PackageAPI
   */
  public static nuspecReader(fileData: string): PackageResult {
    if (!!parser.validate(fileData.toString())) {
      const jsonObj: any = parser.parse(fileData.toString());
      tl.debug(`NuspecReader: ${JSON.stringify(jsonObj)}`);
      return { name: jsonObj.package.metadata.id, version: jsonObj.package.metadata.version } as PackageResult;
    }
  }

  /**
   * Npm package file reader
   *
   * @static
   * @param {string} fileData
   * @returns {PackageResult}
   * @memberof PackageAPI
   */
  public static npmReader(fileData: string): PackageResult {
    if (fileData == null) new Error('not allowed value: fileData is null');
    const jsonObj: any = JSON.parse(fileData);
    tl.debug(`NpmReader: ${JSON.stringify(jsonObj)}`);
    return jsonObj as PackageResult;
  }

  /**
   * Extract packages
   *
   * @param {string} filePath
   * @param {any} filter
   * @param {CallbackFunctionVariadic} reader
   * @returns {PackageResult}
   * @memberof PackageAPI
   */
  public async extractPackages(
    filePath: string,
    filter: any,
    reader: CallbackFunctionVariadic,
  ): Promise<PackageResult> {
    try {
      const files = await decompress(filePath, '', {
        filter,
      });
      if (files.length > 0) {
        return reader(files[0].data);
      }
    } catch (err) {
      tl.warning(`${JSON.stringify(err)}`);
    }
    return null;
  }

  /**
   * Promote package to different views
   *
   * @param {{
   *     org: string;
   *     project?: string;
   *     feedId: string;
   *     packageName: string;
   *     packageVersion: string;
   *     packageType?: ProtocolType;
   *     viewId?: string;
   *     operation?: JsonPatchOperationTypeEnum;
   *     baseUrl?: string;
   *   }} {
   *     org,
   *     project,
   *     feedId,
   *     packageName,
   *     packageVersion,
   *     packageType = ProtocolType.nuGet,
   *     viewId = 'Prerelease',
   *     operation = JsonPatchOperationTypeEnum.add,
   *     baseUrl = 'https://pkgs.dev.azure.com/',
   *   }
   * @returns {Promise<boolean>}
   * @memberof PackageAPI
   */
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

  /**
   * Get Package Version by name
   *
   * @param {{
   *     org: string;
   *     project?: string;
   *     feedName: string;
   *     packageName: string;
   *     packageVersion: string;
   *     packageType?: ProtocolType;
   *     baseUrl?: string;
   *   }} {
   *     org,
   *     project,
   *     feedName,
   *     packageName,
   *     packageVersion,
   *     packageType = ProtocolType.nuGet,
   *     baseUrl = 'https://pkgs.dev.azure.com/',
   *   }
   * @returns {Promise<Package>}
   * @memberof PackageAPI
   */
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

  /**
   * Get Package version by id
   *
   * @param param0
   */
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

  /**
   * Get Package details
   *
   * @param param0 options
   */
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

  /**
   * Get Packages
   *
   * @param param0 options
   */
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

  /**
   * Search package by name
   *
   * @param param0 option
   */
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
