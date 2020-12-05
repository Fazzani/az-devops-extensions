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
const feedApi_1 = require("../tasks/promote/feedApi");
const chai_1 = require("chai");
describe('Feed Api tests', () => {
    const org = 'henifazzani';
    const feedName = 'packages';
    const feedNameGuid = '9a9327ae-8c62-4cc1-80a5-7365f97a5b87';
    it('GetFeedByName should succeed', () => __awaiter(void 0, void 0, void 0, function* () {
        const feed = yield feedApi_1.feedApi.findByName({ org, feedName });
        chai_1.expect(feed).to.exist;
        chai_1.expect(feed.id).to.exist;
    }));
    it('findByGuid should succeed', () => __awaiter(void 0, void 0, void 0, function* () {
        const feed = yield feedApi_1.feedApi.findById({ org, feedId: feedNameGuid });
        chai_1.expect(feed).to.exist;
        chai_1.expect(feed.id).to.exist;
    }));
    it('GetFeedByName should empty', () => __awaiter(void 0, void 0, void 0, function* () {
        const feed = yield feedApi_1.feedApi.findByName({ org, feedName: 'tmp123323' });
        chai_1.expect(feed).to.not.exist;
    }));
});
//# sourceMappingURL=feed.spec.js.map