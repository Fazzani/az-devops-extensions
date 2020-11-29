import { Common, HttpMethod } from './common';
import { JsonPatchOperation, Operation, ResponseList } from './commonApi';
import * as tl from 'azure-pipelines-task-lib/task';
import * as admzip from 'adm-zip';
import * as parser from 'fast-xml-parser';
import * as fs from 'fs';
import path = require('path');
import { FeedAPI } from './feedApi';

type CallbackFunctionVariadic = (...args: any[]) => PackageResult;

export class PackageAPI {
  public static async getInfo({
    filePath,
    type = ProtocolType.NuGet,
  }: {
    filePath: string;
    type?: ProtocolType;
  }): Promise<PackageResult> {
    switch (type) {
      case ProtocolType.NuGet:
        return await PackageAPI.extractPackages(filePath, PackageAPI.NuspecReader);
      case ProtocolType.Npm:
        return await PackageAPI.extractPackages(filePath, PackageAPI.NpmReader);
      default:
        tl.warning(`not supported type ${type}`);
        break;
    }
    return null;
  }

  public static NuspecReader(fileData: string): PackageResult {
    if (!!parser.validate(fileData)) {
      const jsonObj = parser.parse(fileData);
      tl.debug(`NuspecReader: ${jsonObj}`);
      return { name: jsonObj.package.metadata.id, version: jsonObj.package.metadata.version } as PackageResult;
    }
  }

  public static NpmReader(fileData: string): PackageResult {
    const jsonObj = JSON.parse(fileData);
    tl.debug(`NpmReader: ${jsonObj}`);
    return jsonObj as PackageResult;
  }

  public static async extractPackages(filePath: string, reader: CallbackFunctionVariadic): Promise<PackageResult> {
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

  public static async promote({
    org,
    project,
    pat,
    feedId,
    packageName,
    packageVersion,
    packageType = ProtocolType.NuGet,
    viewId = 'Prerelease',
    operation = Operation.Add,
    baseUrl = 'https://pkgs.dev.azure.com/',
    apiVersion = '?api-version=5.0-preview.1',
  }: {
    org: string;
    project?: string;
    pat: string;
    feedId: string;
    packageName: string;
    packageVersion: string;
    packageType?: ProtocolType;
    viewId?: string;
    operation?: Operation;
    baseUrl?: string;
    apiVersion?: string;
  }): Promise<boolean> {
    const feed = await FeedAPI.findById({ org, project, pat, feedId });
    if (feed == null) {
      tl.error(`Feed ${feedId} not found`);
      return false;
    }
    const pkg = await PackageAPI.getVersionByName({
      org,
      project,
      pat,
      feedName: feed.name,
      packageName,
      packageVersion,
      packageType,
      baseUrl,
      apiVersion,
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
      }/${packageType.toLocaleLowerCase()}/packages/${packageName}/versions/${packageVersion}${apiVersion}`;
      const payload: any = { views: { op: operation, path: '/views/-', value: `${viewId}` } as JsonPatchOperation };
      const [status] = await Common.makeRequest({
        token: pat,
        url: apiUrl,
        payload,
        method: HttpMethod.PATCH,
        stringifyData: false,
      });
      return status === 200 || status === 202;
    }
  }

  public static async getVersionByName({
    org,
    project,
    pat,
    feedName,
    packageName,
    packageVersion,
    packageType = ProtocolType.NuGet,
    baseUrl = 'https://pkgs.dev.azure.com/',
    apiVersion = '?api-version=5.0-preview.1',
  }: {
    org: string;
    project?: string;
    pat: string;
    feedName: string;
    packageName: string;
    packageVersion: string;
    packageType?: ProtocolType;
    baseUrl?: string;
    apiVersion?: string;
  }): Promise<Package> {
    try {
      let apiUrl = `${baseUrl}${org}/`;
      if (project != null) {
        apiUrl += `${project}/`;
      }
      apiUrl += `_apis/packaging/feeds/${feedName}/${packageType.toLowerCase()}/packages/${packageName.toLocaleLowerCase()}/versions/${packageVersion}${apiVersion}`;
      const [, pkg] = await Common.makeRequest({ token: pat, url: apiUrl });
      return pkg as Package;
    } catch (error) {
      if (error.response.status === 404) {
        tl.debug(`Package ${packageName} with version ${packageVersion} not found`);
        return null;
      }
    }
  }

  public static async getVersionById({
    org,
    project,
    pat,
    feedId,
    packageId,
    packageVersionId,
    packageType = ProtocolType.NuGet,
    baseUrl = 'https://pkgs.dev.azure.com/',
    apiVersion = '?api-version=5.0-preview.1',
  }: {
    org: string;
    project?: string;
    pat: string;
    feedId: string;
    packageId: string;
    packageVersionId: string;
    packageType?: ProtocolType;
    baseUrl?: string;
    apiVersion?: string;
  }): Promise<PackageVersion> {
    try {
      let apiUrl = `${baseUrl}${org}/`;
      if (project != null) {
        apiUrl += `${project}/`;
      }
      apiUrl += `_apis/packaging/feeds/${feedId}/${packageType.toLowerCase()}/packages/${packageId}/versions/${packageVersionId}${apiVersion}`;
      const [, pkg] = await Common.makeRequest({ token: pat, url: apiUrl });
      return pkg as PackageVersion;
    } catch (error) {
      if (error.response.status === 404) {
        tl.warning(`Package ${packageId} with version ${packageVersionId} not found`);
        return null;
      }
    }
  }

  public static async get({
    org,
    project,
    pat,
    feedId,
    packageId,
    includeAllVersions = false,
    includeDeleted = false,
    includeDescription = true,
    includeUrls = false,
    isListed = true,
    isRelease = true,
    baseUrl = 'https://feeds.dev.azure.com/',
    apiVersion = '?api-version=6.1-preview.1',
  }: {
    org: string;
    project?: string;
    pat: string;
    feedId: string;
    packageId: string;
    includeAllVersions?: boolean;
    includeDeleted?: boolean;
    includeDescription?: boolean;
    includeUrls?: boolean;
    isListed?: boolean;
    isRelease?: boolean;
    baseUrl?: string;
    apiVersion?: string;
  }): Promise<ResponseList<Package>> {
    try {
      let apiUrl = `${baseUrl}${org}/`;
      if (project != null) {
        apiUrl += `${project}/`;
      }
      apiUrl += `_apis/packaging/feeds/${feedId}/packages/${packageId}/versions${apiVersion}`;
      const [, pkg] = await Common.makeRequest({
        token: pat,
        url: apiUrl,
        params: {
          includeAllVersions,
          includeDeleted,
          includeDescription,
          includeUrls,
          isListed,
          isRelease,
        },
      });
      return pkg as ResponseList<Package>;
    } catch (error) {
      if (error.response.status === 404) {
        tl.warning(`Package ${packageId} not found`);
        return null;
      }
    }
  }

  public static async list({
    org,
    project,
    pat,
    feedId,
    top,
    skip,
    packageNameQuery,
    baseUrl = 'https://feeds.dev.azure.com/',
    apiVersion = '?api-version=5.0-preview.1',
  }: {
    org: string;
    project?: string;
    pat: string;
    feedId: string;
    top: number;
    skip: number;
    packageNameQuery: string;
    baseUrl?: string;
    apiVersion?: string;
  }): Promise<ResponseList<Package>> {
    let apiUrl = `${baseUrl}${org}/`;
    if (project != null) {
      apiUrl += `${project}/`;
    }
    apiUrl += `_apis/packaging/feeds/${feedId}/packages${apiVersion}`;
    const [, pkgs]: [number, ResponseList<Package>] = await Common.makeRequest({
      token: pat,
      url: apiUrl,
      params: {
        packageNameQuery,
        skip,
        top,
      },
    });
    return pkgs;
  }

  public static async findByName({
    org,
    project,
    pat,
    feedId,
    packageName,
    baseUrl = 'https://feeds.dev.azure.com/',
    apiVersion = '?api-version=5.0-preview.1',
  }: {
    org: string;
    project?: string;
    pat: string;
    feedId: string;
    packageName: string;
    baseUrl?: string;
    apiVersion?: string;
  }): Promise<Package> {
    const pkgs = await PackageAPI.list({
      org,
      project,
      pat,
      feedId,
      top: 1,
      skip: 0,
      packageNameQuery: packageName,
      baseUrl,
      apiVersion,
    });
    if (pkgs.count > 0) return pkgs.value[0];
    return null;
  }
}

export enum ProtocolType {
  Npm = 'Npm',
  NuGet = 'NuGet',
  Maven = 'Maven',
  Python = 'PyPi',
  Universal = 'Upack',
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

export enum FeedViewType {
  implicit = 'implicit',
  none = 'none',
  release = 'release',
}

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
