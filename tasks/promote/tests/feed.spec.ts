import 'mocha';
import { FeedAPI } from '../feedApi';
import { expect } from 'chai';

describe('Feed Api tests', () => {
  const org = 'henifazzani';
  const feedName = 'packages';
  const feedNameGuid ='9a9327ae-8c62-4cc1-80a5-7365f97a5b87';
  const pat = process.env.PAT_HENI_FAZZANI_ARTIFACTS;

  it('GetFeedByName should succeed', async () => {
    const feed = await FeedAPI.findByName({ org, pat, feedName });
    // tslint:disable-next-line: no-unused-expression
    expect(feed).to.exist;
    // tslint:disable-next-line: no-unused-expression
    expect(feed.id).to.exist;
  });

   it('findByGuid should succeed', async () => {
     const feed = await FeedAPI.findById({ org, pat, feedId: feedNameGuid });
     // tslint:disable-next-line: no-unused-expression
     expect(feed).to.exist;
     // tslint:disable-next-line: no-unused-expression
     expect(feed.id).to.exist;
   });

  it('GetFeedByName should empty', async () => {
    const feed = await FeedAPI.findByName({ org, pat, feedName: 'tmp123323' });
    // tslint:disable-next-line: no-unused-expression
    expect(feed).to.not.exist;
  });
});
