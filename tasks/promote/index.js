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
const tl = require("azure-pipelines-task-lib/task");
const packageApi_1 = require("./packageApi");
const url = require("url");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const option = readInputs();
            tl.debug(`Inputs: ${JSON.stringify(option)}`);
            const [valid, errors] = validateInputs(option);
            if (!valid) {
                errors.forEach(tl.error);
                tl.setResult(tl.TaskResult.Failed, 'Invalid inputs');
                return 1;
            }
            const pat = tl.getEndpointAuthorizationParameter('SystemVssConnection', 'AccessToken', false);
            tl.debug(`authToken: ${pat}`);
            switch (option.PackageType) {
                case PackageType.nameVersion:
                    option.packageIds.forEach((pv) => __awaiter(this, void 0, void 0, function* () {
                        if (!(yield packageApi_1.PackageAPI.promote({
                            org: option.TfsUri.org,
                            pat,
                            feedId: option.feed,
                            packageName: pv,
                            packageVersion: option.version,
                            viewId: option.view,
                        })))
                            tl.warning(`failing to promote package ${pv} for ignored reason!`);
                    }));
                    break;
                case PackageType.packageFiles:
                    option.packagesPatterns.forEach((pp) => __awaiter(this, void 0, void 0, function* () {
                        const pkgInfos = yield packageApi_1.PackageAPI.getInfo({ patterns: pp, cwd: option.packagesDirectory });
                        pkgInfos.forEach((pi) => __awaiter(this, void 0, void 0, function* () {
                            if (!(yield packageApi_1.PackageAPI.promote({
                                org: option.TfsUri.org,
                                pat,
                                feedId: option.feed,
                                packageName: pi.name,
                                packageVersion: pi.version,
                                viewId: option.view,
                            }))) {
                                tl.warning(`failing to promote package ${pi.name} for ignored reason!`);
                            }
                        }));
                    }));
                    break;
                default:
                    tl.warning('not supported package type yet');
                    process.exit(1);
            }
        }
        catch (err) {
            tl.debug(err.message);
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
function validateInputs(option) {
    let valid = true;
    const errors = [];
    if (option.view === '') {
        valid = false;
        errors.push("Invalid view entry: can't be empty");
    }
    return [valid, errors];
}
function readInputs() {
    const option = new Option();
    option.view = tl.getInput('releaseview', true);
    option.packagesDirectory = tl.getPathInput('packagesdirectory', false);
    option.packagesPatterns = tl.getDelimitedInput('packagespattern', ';', false);
    option.packageIds = tl.getDelimitedInput('packageids', ',', false);
    option.version = tl.getInput('version', false);
    option.type = tl.getInput('inputType', true);
    option.feed = tl.getInput('feed', true);
    option.tfsUri = tl.getVariable('system.teamfoundationserveruri');
    return option;
}
class Option {
    get PackageType() {
        return this.type === 'nameVersion' ? PackageType.nameVersion : PackageType.packageFiles;
    }
    get TfsUri() {
        const q = url.parse(this.tfsUri);
        return Object.assign(Object.assign({}, q), { org: q.pathname.split('/')[1] });
    }
}
var PackageType;
(function (PackageType) {
    PackageType[PackageType["packageFiles"] = 0] = "packageFiles";
    PackageType[PackageType["nameVersion"] = 1] = "nameVersion";
})(PackageType || (PackageType = {}));
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLG9EQUFvRDtBQUNwRCw2Q0FBMEM7QUFDMUMsMkJBQTJCO0FBRTNCLFNBQWUsR0FBRzs7UUFDaEIsSUFBSTtZQUNGLE1BQU0sTUFBTSxHQUFHLFVBQVUsRUFBRSxDQUFDO1lBQzVCLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUU5QyxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNWLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6QixFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3JELE9BQU8sQ0FBQyxDQUFDO2FBQ1Y7WUFFRCxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsaUNBQWlDLENBQUMscUJBQXFCLEVBQUUsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlGLEVBQUUsQ0FBQyxLQUFLLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRTlCLFFBQVEsTUFBTSxDQUFDLFdBQVcsRUFBRTtnQkFDMUIsS0FBSyxXQUFXLENBQUMsV0FBVztvQkFDMUIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBTyxFQUFFLEVBQUUsRUFBRTt3QkFDckMsSUFDRSxDQUFDLENBQUMsTUFBTSx1QkFBVSxDQUFDLE9BQU8sQ0FBQzs0QkFDekIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRzs0QkFDdEIsR0FBRzs0QkFDSCxNQUFNLEVBQUUsTUFBTSxDQUFDLElB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