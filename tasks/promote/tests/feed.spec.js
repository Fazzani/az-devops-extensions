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
const feedApi_1 = require("../feedApi");
const chai_1 = require("chai");
describe('Feed Api tests', () => {
    const org = 'henifazzani';
    const project = 'SynkerAPI';
    const feedName = 'packages';
    const pat = process.env.PAT_HENI_FAZZANI_ARTIFACTS;
    const packageName = 'GDrive.Anomalies.Library';
    before(() => { });
    after(() => { });
    it('GetFeedByName should succeed', () => __awaiter(void 0, void 0, void 0, function* () {
        const feed = yield feedApi_1.FeedAPI.findByName(org, undefined, pat, feedName);
        chai_1.expect(feed).to.be.not.undefined;
        chai_1.expect(feed.id).to.be.not.undefined;
    }));
    it('GetFeedByName should empty', () => __awaiter(void 0, void 0, void 0, function* () {
        const feed = yield feedApi_1.FeedAPI.findByName(org, undefined, pat, 'tmp123323');
        chai_1.expect(feed).to.be.undefined;
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmVlZC5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmVlZC5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBR0EsaUJBQWU7QUFDZix3Q0FBcUM7QUFDckMsK0JBQThCO0FBRTlCLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7SUFDOUIsTUFBTSxHQUFHLEdBQUcsYUFBYSxDQUFDO0lBQzFCLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQztJQUM1QixNQUFNLFFBQVEsR0FBRyxVQUFVLENBQUM7SUFDNUIsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQztJQUNuRCxNQUFNLFdBQVcsR0FBRywwQkFBMEIsQ0FBQztJQUMvQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUM7SUFFakIsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyxDQUFDO0lBRWhCLEVBQUUsQ0FBQyw4QkFBOEIsRUFBRSxHQUFTLEVBQUU7UUFDNUMsTUFBTSxJQUFJLEdBQUcsTUFBTSxpQkFBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUVyRSxhQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO1FBRWpDLGFBQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO0lBQ3RDLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsNEJBQTRCLEVBQUUsR0FBUyxFQUFFO1FBQzFDLE1BQU0sSUFBSSxHQUFHLE1BQU0saUJBQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFeEUsYUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDO0lBQy9CLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyJ9