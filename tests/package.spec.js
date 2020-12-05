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
require("mocha");
const packageApi_1 = require("../packageApi");
const feedApi_1 = require("../feedApi");
const chai_1 = require("chai");
const fs = require("fs");
const path = require("path");
describe('Package Api tests', () => {
    const org = 'henifazzani';
    const project = 'SynkerAPI';
    const feedId = '9a9327ae-8c62-4cc1-80a5-7365f97a5b87';
    const feedName = 'packages';
    const packageName = 'GDrive.Anomalies.Library';
    const packagesPath = path.join(path.dirname(fs.realpathSync(__filename)), 'tests_artifacts');
    it('get should be exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const pkg = yield packageApi_1.packageApi.getVersionByName({
            org,
            feedName: feedId,
            packageName,
            packageVersion: '1.3.5',
        });
        chai_1.expect(pkg).to.exist;
        chai_1.expect(pkg.name).to.exist;
    }));
    it('get should be not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const feed = yield feedApi_1.feedApi.findByName({ org, feedName });
        const pkg = yield packageApi_1.packageApi.getVersionByName({
            org,
            feedName: feed.id,
            packageName,
            packageVersion: '2.2.2',
        });
        chai_1.expect(pkg).to.not.exist;
    }));
    it('promote should success', () => __awaiter(void 0, void 0, void 0, function* () {
        const promoted = yield packageApi_1.packageApi.promote({
            org,
            feedId,
            packageName,
            packageVersion: '1.3.2',
        });
        chai_1.expect(promoted).to.be.true;
    }));
    it('findByName should success', () => __awaiter(void 0, void 0, void 0, function* () {
        const feed = yield feedApi_1.feedApi.findByName({ org, feedName });
        const pkg = yield packageApi_1.packageApi.findByName({ org, feedId: feed.id, packageName });
        chai_1.expect(pkg).to.exist;
        chai_1.expect(pkg.name).to.eq(packageName);
    }));
    it('getInfo nuget should success', () => __awaiter(void 0, void 0, void 0, function* () {
        const pkg = yield packageApi_1.packageApi.getInfo({
            filePath: path.join(packagesPath, 'gdrive.anomalies.library.1.0.0-alpha0024-1224.nupkg'),
        });
        chai_1.expect(pkg).to.exist;
        chai_1.expect(pkg.name.toLowerCase()).to.eq('gdrive.anomalies.library');
        chai_1.expect(pkg.version).to.contains('1.0.0-alpha0024-1224');
    }));
    it('getInfo npm tgz file should success', () => __awaiter(void 0, void 0, void 0, function* () {
        const pkg = yield packageApi_1.packageApi.getInfo({
            filePath: path.join(packagesPath, 'test-1.0.0.tgz'),
            type: packageApi_1.ProtocolType.npm,
        });
        chai_1.expect(pkg).to.exist;
        chai_1.expect(pkg.version).to.eq('1.0.0');
    }));
    it('getInfo pipy file should success', () => __awaiter(void 0, void 0, void 0, function* () {
        const pkg = yield packageApi_1.packageApi.getInfo({
            filePath: path.join(packagesPath, 'python-package-example-0.1.tar.gz'),
            type: packageApi_1.ProtocolType.pypi,
        });
        chai_1.expect(pkg).to.exist;
        chai_1.expect(pkg.version).to.eq('0.1');
    }));
});
//# sourceMappingURL=package.spec.js.map