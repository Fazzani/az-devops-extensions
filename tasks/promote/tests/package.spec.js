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
    const feedName = 'packages';
    const pat = process.env.PAT_HENI_FAZZANI_ARTIFACTS;
    const packageName = 'GDrive.Anomalies.Library';
    const packagesPath = path.join(path.dirname(fs.realpathSync(__filename)), 'tests_artifacts');
    before(() => { });
    after(() => { });
    it('get should not undefined', () => __awaiter(void 0, void 0, void 0, function* () {
        const feed = yield feedApi_1.FeedAPI.findByName(org, undefined, pat, feedName);
        const pkg = yield packageApi_1.PackageAPI.getVersionByName(org, undefined, pat, feed.id, packageName, '1.3.5');
        chai_1.expect(pkg).to.be.not.undefined;
        chai_1.expect(pkg.name).to.be.not.undefined;
    }));
    it('get should be undefined', () => __awaiter(void 0, void 0, void 0, function* () {
        const feed = yield feedApi_1.FeedAPI.findByName(org, undefined, pat, feedName);
        const pkg = yield packageApi_1.PackageAPI.getVersionByName(org, undefined, pat, feed.id, packageName, '2.2.2');
        chai_1.expect(pkg).to.be.eq(undefined);
    }));
    it('promote should success', () => __awaiter(void 0, void 0, void 0, function* () {
        const feed = yield feedApi_1.FeedAPI.findByName(org, undefined, pat, feedName);
        const promoted = yield packageApi_1.PackageAPI.promote({ org, project: undefined, pat, feedId: feed.id, packageName, packageVersion: '1.3.2' });
        chai_1.expect(promoted).to.be.eq(true);
    }));
    it('findByName should success', () => __awaiter(void 0, void 0, void 0, function* () {
        const feed = yield feedApi_1.FeedAPI.findByName(org, undefined, pat, feedName);
        const pkg = yield packageApi_1.PackageAPI.findByName(org, undefined, pat, feed.id, packageName);
        chai_1.expect(pkg).to.be.not.undefined;
        chai_1.expect(pkg.name).to.be.eq(packageName);
    }));
    it('getInfo nuget should success', () => __awaiter(void 0, void 0, void 0, function* () {
        const packages = yield packageApi_1.PackageAPI.getInfo({ patterns: '**/*.nupkg', cwd: packagesPath });
        chai_1.expect(packages.length).to.eq(3);
        chai_1.expect(packages[0].name.toLowerCase()).to.be.eq('gdrive.anomalies.library');
        chai_1.expect(packages.map((p) => p.version)).to.be.contains('1.0.0-alpha0024-1224');
    }));
    it('getInfo npm should success', () => __awaiter(void 0, void 0, void 0, function* () {
        const packages = yield packageApi_1.PackageAPI.getInfo({ patterns: '**/*.json', cwd: packagesPath, type: packageApi_1.ProtocolType.Npm });
        chai_1.expect(packages.length).to.eq(2);
        chai_1.expect(packages.map((p) => p.version)).to.be.contains('2.2.0');
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZS5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGFja2FnZS5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQ0EsaUJBQWU7QUFDZiw4Q0FBeUQ7QUFDekQsd0NBQXFDO0FBQ3JDLCtCQUE4QjtBQUM5Qix5QkFBMEI7QUFDMUIsNkJBQThCO0FBRTlCLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7SUFDakMsTUFBTSxHQUFHLEdBQUcsYUFBYSxDQUFDO0lBQzFCLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQztJQUM1QixNQUFNLFFBQVEsR0FBRyxVQUFVLENBQUM7SUFDNUIsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQztJQUNuRCxNQUFNLFdBQVcsR0FBRywwQkFBMEIsQ0FBQztJQUMvQyxNQUFNLFlBQVksR0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFFOUYsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyxDQUFDO0lBRWpCLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUMsQ0FBQztJQUVoQixFQUFFLENBQUMsMEJBQTBCLEVBQUUsR0FBUyxFQUFFO1FBQ3hDLE1BQU0sSUFBSSxHQUFHLE1BQU0saUJBQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFckUsTUFBTSxHQUFHLEdBQUcsTUFBTSx1QkFBVSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRWxHLGFBQU0sQ0FBQyxHQUFHLENBQUMs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LENBQUMsQ0FBQSxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsNEJBQTRCLEVBQUUsR0FBUyxFQUFFO1FBQzFDLE1BQU0sUUFBUSxHQUFHLE1BQU0sdUJBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLHlCQUFZLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNoSCxhQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsYUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pFLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyJ9