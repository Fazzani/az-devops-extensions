"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedVisibility = exports.FeedViewType = exports.ProtocolType = exports.PackageAPI = void 0;
const common_1 = require("./common");
const commonApi_1 = require("./commonApi");
const tl = require("azure-pipelines-task-lib/task");
const admzip = require("adm-zip");
const fg = require("tiny-glob");
const parser = require("fast-xml-parser");
const fs = require("fs");
const path = require("path");
class PackageAPI {
    static getInfo({ patterns, cwd, type = ProtocolType.NuGet, }) {
        return __awaiter(this, void 0, void 0, function* () {
            let packages;
            switch (type) {
                case ProtocolType.NuGet:
                    packages = yield PackageAPI.extractPackages(patterns, PackageAPI.NuspecReader, cwd);
                    tl.debug(`${packages.length} packages versions founded`);
                    break;
                case ProtocolType.Npm:
                    packages = yield PackageAPI.extractPackages(patterns, PackageAPI.NpmReader, cwd);
                    tl.debug(`${packages.length} packages versions founded`);
                    break;
                default:
                    tl.warning(`not supported type ${type}`);
                    break;
            }
            return packages;
        });
    }
    static NuspecReader(fileData) {
        if (!!parser.validate(fileData)) {
            const jsonObj = parser.parse(fileData);
            tl.debug(jsonObj);
            return { name: jsonObj.package.metadata.id, version: jsonObj.package.metadata.version };
        }
    }
    static NpmReader(fileData) {
        const jsonObj = JSON.parse(fileData);
        tl.debug(jsonObj);
        return jsonObj;
    }
    static extractPackages(patterns, reader, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield fg(patterns, { filesOnly: true, cwd, absolute: true });
            if (files === undefined || files.length === 0)
                return [];
            const packages = [];
            files.forEach((f) => __awaiter(this, void 0, void 0, function* () {
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
                }
                catch (err) {
                    tl.warning(`${JSON.stringify(err)}`);
                }
            }));
            return packages;
        });
    }
    static promote({ org, project, pat, feedId, packageName, packageVersion, packageType = ProtocolType.NuGet, viewId = 'Prerelease', operation = commonApi_1.Operation.Add, baseUrl = 'https://pkgs.dev.azure.com/', apiVersion = '?api-version=5.0-preview.1', }) {
        return __awaiter(this, void 0, void 0, function* () {
            let apiUrl = `${baseUrl}${org}/`;
            if (project !== undefined && project !== null) {
                apiUrl += `${project}/`;
            }
            apiUrl += `_apis/packaging/feeds/${feedId}/${packageType.toLocaleLowerCase()}/packages/${packageName}/versions/${packageVersion}${apiVersion}`;
            const pkg = yield PackageAPI.getVersionByName(org, project, pat, feedId, packageName, packageVersion, packageType, baseUrl, apiVersion);
            if (pkg !== undefined) {
                const payload = { views: { op: operation, path: '/views/-', value: `${viewId}` } };
                const [status] = yield common_1.Common.makeRequest(pat, apiUrl, payload, undefined, common_1.HttpMethod.PATCH, false);
                return status === 200 || status === 202;
            }
        });
    }
    static getVersionByName(org, project, pat, feedId, packageName, packageVersion, packageType = ProtocolType.NuGet, baseUrl = 'https://pkgs.dev.azure.com/', apiVersion = '?api-version=5.0-preview.1') {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let apiUrl = `${baseUrl}${org}/`;
                if (project !== undefined && project !== null) {
                    apiUrl += `${project}/`;
                }
                apiUrl += `_apis/packaging/feeds/${feedId}/${packageType.toLowerCase()}/packages/${packageName}/versions/${packageVersion}${apiVersion}`;
                const [, pkg] = yield common_1.Common.makeRequest(pat, apiUrl);
                return pkg;
            }
            catch (error) {
                if (error.response.status === 404) {
                    tl.warning(`Package ${packageName} with version ${packageVersion} not found`);
                    return undefined;
                }
            }
        });
    }
    static getVersionById(org, project, pat, feedId, packageId, packageVersionId, packageType = ProtocolType.NuGet, baseUrl = 'https://pkgs.dev.azure.com/', apiVersion = '?api-version=5.0-preview.1') {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let apiUrl = `${baseUrl}${org}/`;
                if (project !== undefined && project !== null) {
                    apiUrl += `${project}/`;
                }
                apiUrl += `_apis/packaging/feeds/${feedId}/${packageType.toLowerCase()}/packages/${packageId}/versions/${packageVersionId}${apiVersion}`;
                const [, pkg] = yield common_1.Common.makeRequest(pat, apiUrl);
                return pkg;
            }
            catch (error) {
                if (error.response.status === 404) {
                    tl.warning(`Package ${packageId} with version ${packageVersionId} not found`);
                    return undefined;
                }
            }
        });
    }
    static get(org, project, pat, feedId, packageId, baseUrl = 'https://feeds.dev.azure.com/', apiVersion = '?api-version=5.0-preview.1') {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let apiUrl = `${baseUrl}${org}/`;
                if (project !== undefined && project !== null) {
                    apiUrl += `${project}/`;
                }
                apiUrl += `_apis/packaging/feeds/${feedId}/packages/${packageId}/versions${apiVersion}`;
                const [, pkg] = yield common_1.Common.makeRequest(pat, apiUrl);
                return pkg;
            }
            catch (error) {
                if (error.response.status === 404) {
                    tl.warning(`Package ${packageId} not found`);
                    return undefined;
                }
            }
        });
    }
    static list(org, project, pat, feedId, top, skip, packageNameQuery, baseUrl = 'https://feeds.dev.azure.com/', apiVersion = '?api-version=5.0-preview.1') {
        return __awaiter(this, void 0, void 0, function* () {
            let apiUrl = `${baseUrl}${org}/`;
            if (project !== undefined && project !== null) {
                apiUrl += `${project}/`;
            }
            apiUrl += `_apis/packaging/feeds/${feedId}/packages${apiVersion}`;
            const [, pkgs] = yield common_1.Common.makeRequest(pat, apiUrl, undefined, {
                packageNameQuery,
                skip,
                top,
            });
            return pkgs.value;
        });
    }
    static findByName(org, project, pat, feedId, packageName, baseUrl = 'https://feeds.dev.azure.com/', apiVersion = '?api-version=5.0-preview.1') {
        return __awaiter(this, void 0, void 0, function* () {
            const pkgs = yield PackageAPI.list(org, project, pat, feedId, 1, 0, packageName, baseUrl, apiVersion);
            if (pkgs.length > 0)
                return pkgs[0];
            return undefined;
        });
    }
}
exports.PackageAPI = PackageAPI;
var ProtocolType;
(function (ProtocolType) {
    ProtocolType["Npm"] = "Npm";
    ProtocolType["NuGet"] = "NuGet";
    ProtocolType["Maven"] = "Maven";
    ProtocolType["Python"] = "PyPi";
    ProtocolType["Universal"] = "Upack";
})(ProtocolType = exports.ProtocolType || (exports.ProtocolType = {}));
var FeedViewType;
(function (FeedViewType) {
    FeedViewType["implicit"] = "implicit";
    FeedViewType["none"] = "none";
    FeedViewType["release"] = "release";
})(FeedViewType = exports.FeedViewType || (exports.FeedViewType = {}));
var FeedVisibility;
(function (FeedVisibility) {
    FeedVisibility["aadTenant"] = "aadTenant";
    FeedVisibility["collection"] = "collection";
    FeedVisibility["organization"] = "organization";
    FeedVisibility["private"] = "private";
})(FeedVisibility = exports.FeedVisibility || (exports.FeedVisibility = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZUFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBhY2thZ2VBcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQThDO0FBQzlDLDJDQUF3RjtBQUN4RixvREFBb0Q7QUFDcEQsa0NBQWtDO0FBQ2xDLGdDQUFpQztBQUNqQywwQ0FBMEM7QUFDMUMseUJBQXlCO0FBQ3pCLDZCQUE4QjtBQUk5QixNQUFhLFVBQVU7SUFDZCxNQUFNLENBQU8sT0FBTyxDQUFDLEVBQzFCLFFBQVEsRUFDUixHQUFHLEVBQ0gsSUFBSSxHQUFHLFlBQVksQ0FBQyxLQUFLLEdBSzFCOztZQUNDLElBQUksUUFBeUIsQ0FBQztZQUM5QixRQUFRLElBQUksRUFBRTtnQkFDWixLQUFLLFlBQVksQ0FBQyxLQUFLO29CQUNyQixRQUFRLEdBQUcsTUFBTSxVQUFVLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNwRixFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sNEJBQTRCLENBQUMsQ0FBQztvQkFDekQsTUFBTTtnQkFDUixLQUFLLFlBQVksQ0FBQyxHQUFHO29CQUNuQixRQUFRLEdBQUcsTUFBTSxVQUFVLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNqRixFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sNEJBQTRCLENBQUMsQ0FBQztvQkFDekQsTUFBTTtnQkFDUjtvQkFDRSxFQUFFLENBQUMsT0FBTyxDQUFDLHNCQUFzQixJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUN6QyxNQUFNO2FBQ1Q7WUFDRCxPQUFPLFFBQVEsQ0FBQztRQUNsQixDQUFDO0tBQUE7SUFFTSxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQWdCO1FBQ3pDLElBQUksQ0FBQyxDQUFD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