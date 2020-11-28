import { Common, HttpMethod } from './common';
import { JsonPatchOperation, Operation, PackageViews, ResponseList } from './commonApi';
import * as tl from 'azure-pipelines-task-lib/task';
import * as admzip from 'adm-zip';
import fg = require('tiny-glob');
import * as parser from 'fast-xml-parser';
import * as fs from 'fs';
import path = require('path');

type CallbackFunctionVariadic = (...args: any[]) => PackageResult;

export class PackageAPI {
  public static async getInfo({
    patterns,
    cwd,
    type = ProtocolType.NuGet,
  }: {
    patterns: string;
    cwd?: string;
    type?: ProtocolType;
  }): Promise<PackageResult[]> {
    let packages: PackageResult[];
    switch (type) {
      case ProtocolType.NuGet:
        packages = await PackageAPI.extractPackages(patterns, PackageAPI.NuspecReader, cwd);
        tl.debug(`${packages.length} packages versions founded`);
        break;
      case ProtocolType.Npm:
        packages = await PackageAPI.extractPackages(patterns, PackageAPI.NpmReader, cwd);
        tl.debug(`${packages.length} packages versions founded`);
        break;
      default:
        tl.warning(`not supported type ${type}`);
        break;
    }
    return packages;
  }

  public static NuspecReader(fileData: string): PackageResult {
    if (!!parser.validate(fileData)) {
      const jsonObj = parser.parse(fileData);
      tl.debug(jsonObj);
      return { name: jsonObj.package.metadata.id, version: jsonObj.package.metadata.version } as PackageResult;
    }
  }

  public static NpmReader(fileData: string): PackageResult {
    const jsonObj = JSON.parse(fileData);
    tl.debug(jsonObj);
    return jsonObj as PackageResult;
  }

  public static async extractPackages(
    patterns: string,
    reader: CallbackFunctionVariadic,
    cwd?: string,
  ): Promise<PackageResult[]> {
    const files = await fg(patterns, { filesOnly: true, cwd, absolute: true });
    if (files === undefined || files.length === 0) return [];
    const packages: PackageResult[] = [];
    files.forEach(async (f) => {
      try {
        const ext = path.extname(f);
        switch (ext) {
          case '.nupkg':
          case '.zip':
            const zipEntries = new admzip(f).getEntries().filter((e) => !e.isDirectory && e.name.endsWith('nuspec'));
            if (zipEntries !== undefined && zipEntries.length > 0) {
              packages.push(reader(zipEntries[0].getData().toString('utf-8')));
            }
            break;
          case '.json':
            const content = fs.readFileSync(f, { encoding: 'utf8' });
            packages.push(reader(content));
            break;
          default:
            tl.debug(`Not supported extension ${ext}`);
        }
      } catch (err) {
        tl.warning(`${JSON.stringify(err)}`);
      }
    });
    return packages;
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
    org: string | undefined;
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
    let apiUrl = `${baseUrl}${org}/`;
    if (project !== undefined && project !== null) {
      apiUrl += `${project}/`;
    }
    apiUrl += `_apis/packaging/feeds/${feedId}/${packageType.toLocaleLowerCase()}/packages/${packageName}/versions/${packageVersion}${apiVersion}`;
    const pkg = await PackageAPI.getVersionByName(
      org,
      project,
      pat,
      feedId,
      packageName,
      packageVersion,
      packageType,
      baseUrl,
      apiVersion,
    );
    if (pkg !== undefined) {
      const payload: any = { views: { op: operation, path: '/views/-', value: `${viewId}` } as JsonPatchOperation };
      const [status] = await Common.makeRequest(pat, apiUrl, payload, undefined, HttpMethod.PATCH, false);
      return status === 200 || status === 202;
    }
  }

  public static async getVersionByName(
    org: string | undefined,
    project: string | undefined,
    pat: string,
    feedId: string,
    packageName: string,
    packageVersion: string,
    packageType: ProtocolType = ProtocolType.NuGet,
    baseUrl: string = 'https://pkgs.dev.azure.com/',
    apiVersion: string = '?api-version=5.0-preview.1',
  ): Promise<Package> {
    try {
      let apiUrl = `${baseUrl}${org}/`;
      if (project !== undefined && project !== null) {
        apiUrl += `${project}/`;
      }
      apiUrl += `_apis/packaging/feeds/${feedId}/${packageType.toLowerCase()}/packages/${packageName}/versions/${packageVersion}${apiVersion}`;
      const [, pkg] = await Common.makeRequest(pat, apiUrl);
      return pkg as Package;
    } catch (error) {
      if (error.response.status === 404) {
        tl.debug(`Package ${packageName} with version ${packageVersion} not found`);
        return undefined;
      }
    }
  }

  public static async getVersionById(
    org: string | undefined,
    project: string | undefined,
    pat: string,
    feedId: string,
    packageId: string,
    packageVersionId: string,
    packageType: ProtocolType = ProtocolType.NuGet,
    baseUrl: string = 'https://pkgs.dev.azure.com/',
    apiVersion: string = '?api-version=5.0-preview.1',
  ): Promise<PackageVersion> {
    try {
      let apiUrl = `${baseUrl}${org}/`;
      if (project !== undefined && project !== null) {
        apiUrl += `${project}/`;
      }
      apiUrl += `_apis/packaging/feeds/${feedId}/${packageType.toLowerCase()}/packages/${packageId}/versions/${packageVersionId}${apiVersion}`;
      const [, pkg] = await Common.makeRequest(pat, apiUrl);
      return pkg as PackageVersion;
    } catch (error) {
      if (error.response.status === 404) {
        tl.warning(`Package ${packageId} with version ${packageVersionId} not found`);
        return undefined;
      }
    }
  }

  // GET https://feeds.dev.azure.com/{organization}/{project}/_apis/packaging/Feeds/{feedId}/packages/{packageId}?api-version=6.1-preview.1
  public static async get(
    org: string | undefined,
    project: string | undefined,
    pat: string,
    feedId: string,
    packageId: string,
    baseUrl: string = 'https://feeds.dev.azure.com/',
    apiVersion: string = '?api-version=5.0-preview.1',
  ): Promise<Package> {
    try {
      let apiUrl = `${baseUrl}${org}/`;
      if (project !== undefined && project !== null) {
        apiUrl += `${project}/`;
      }
      apiUrl += `_apis/packaging/feeds/${feedId}/packages/${packageId}/versions${apiVersion}`;
      const [, pkg] = await Common.makeRequest(pat, apiUrl);
      return pkg as Package;
    } catch (error) {
      if (error.response.status === 404) {
        tl.warning(`Package ${packageId} not found`);
        return undefined;
      }
    }
  }

  public static async list(
    org: string | undefined,
    project: string | undefined,
    pat: string,
    feedId: string,
    top: number,
    skip: number,
    packageNameQuery: string,
    baseUrl: string = 'https://feeds.dev.azure.com/',
    apiVersion: string = '?api-version=5.0-preview.1',
  ): Promise<Package[]> {
    let apiUrl = `${baseUrl}${org}/`;
    if (project !== undefined && project !== null) {
      apiUrl += `${project}/`;
    }
    apiUrl += `_apis/packaging/feeds/${feedId}/packages${apiVersion}`;
    const [, pkgs]: [number, ResponseList<Package>] = await Common.makeRequest(pat, apiUrl, undefined, {
      packageNameQuery,
      skip,
      top,
    });
    return pkgs.value;
  }

  public static async findByName(
    org: string | undefined,
    project: string | undefined,
    pat: string,
    feedId: string,
    packageName: string,
    baseUrl: string = 'https://feeds.dev.azure.com/',
    apiVersion: string = '?api-version=5.0-preview.1',
  ): Promise<Package> {
    const pkgs: Package[] = await PackageAPI.list(org, project, pat, feedId, 1, 0, packageName, baseUrl, apiVersion);
    if (pkgs.length > 0) return pkgs[0];
    return undefined;
  }
}

// export enum PackageType {
//   Npm = 'npm',
//   NuGet = 'nuget',
//   Maven = 'maven',
//   Python = 'pypi',
//   Universal = 'upack',
// }

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
