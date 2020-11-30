/* eslint-disable @typescript-eslint/no-unused-expressions */
import 'mocha';
import { feedApi } from '../feedApi';
import { expect } from 'chai';

describe('Feed Api tests', () => {
  const org = 'henifazzani';
  const feedName = 'packages';
  const feedNameGuid ='9a9327ae-8c62-4cc1-80a5-7365f97a5b87';

  it('GetFeedByName should succeed', async () => {
    const feed = await feedApi.findByName({ org, feedName });
    expect(feed).to.exist;
    expect(feed.id).to.exist;
  });

   it('findByGuid should succeed', async () => {
     const feed = await feedApi.findById({ org, feedId: feedNameGuid });
     expect(feed).to.exist;
     expect(feed.id).to.exist;
   });

  it('GetFeedByName should empty', async () => {
    const feed = await feedApi.findByName({ org, feedName: 'tmp123323' });
    expect(feed).to.not.exist;
  });
});
