import 'mocha';
import { FeedAPI } from '../feedApi';
import { expect } from 'chai';

describe('Feed Api tests', () => {
  const org = 'henifazzani';
  const feedName = 'packages';
  const pat = process.env.PAT_HENI_FAZZANI_ARTIFACTS;

  it('GetFeedByName should succeed', async () => {
    const feed = await FeedAPI.findByName(org, undefined, pat, feedName);
    // tslint:disable-next-line: no-unused-expression
    expect(feed).to.be.not.undefined;
    // tslint:disable-next-line: no-unused-expression
    expect(feed.id).to.be.not.undefined;
  });

  it('GetFeedByName should empty', async () => {
    const feed = await FeedAPI.findByName(org, undefined, pat, 'tmp123323');
    // tslint:disable-next-line: no-unused-expression
    expect(feed).to.be.undefined;
  });
});
