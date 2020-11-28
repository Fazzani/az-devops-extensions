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
exports.FeedAPI = void 0;
const common_1 = require("./common");
class FeedAPI {
    static findByName(org, project, pat, feedName, baseUrl = 'https://feeds.dev.azure.com/', apiVersion = '?api-version=5.0-preview.1') {
        return __awaiter(this, void 0, void 0, function* () {
            let apiUrl = `${baseUrl}${org}/`;
            if (project !== undefined && project !== null) {
                apiUrl += `${project}/`;
            }
            apiUrl += `_apis/packaging/feeds${apiVersion}`;
            const [, feeds] = yield common_1.Common.makeRequest(pat, apiUrl);
            if (feeds.count > 0) {
                return feeds.value.find((x) => x.name === feedName);
            }
        });
    }
}
exports.FeedAPI = FeedAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmVlZEFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZlZWRBcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQWtDO0FBRWxDLE1BQWEsT0FBTztJQUNYLE1BQU0sQ0FBTyxVQUFVLENBQzVCLEdBQXVCLEVBQ3ZCLE9BQTJCLEVBQzNCLEdBQVcsRUFDWCxRQUFnQixFQUNoQixVQUFrQiw4QkFBOEIsRUFDaEQsYUFBcUIsNEJBQTRCOztZQUVqRCxJQUFJLE1BQU0sR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUNqQyxJQUFJLE9BQU8sS0FBSyxTQUFTLElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtnQkFDN0MsTUFBTSxJQUFJLEdBQUcsT0FBTyxHQUFHLENBQUM7YUFDekI7WUFDRCxNQUFNLElBQUksd0JBQXdCLFVBQVUsRUFBRSxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFrQixNQUFNLGVBQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZFLElBQUksS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUU7Z0JBQ25CLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFTLENBQUM7YUFDbkU7UUFDSCxDQUFDO0tBQUE7Q0FDRjtBQW5CRCwwQkFtQkMifQ==