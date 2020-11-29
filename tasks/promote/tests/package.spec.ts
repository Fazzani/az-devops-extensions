// import * as ttm from 'azure-pipelines-task-lib/mock-test';
import 'mocha';
import { PackageAPI, ProtocolType } from '../packageApi';
import { FeedAPI } from '../feedApi';
import { expect, assert } from 'chai';
import fs = require('fs');
import path = require('path');

describe('Package Api tests', () => {
  const org = 'henifazzani';
  const project = 'SynkerAPI';
  const feedId = '9a9327ae-8c62-4cc1-80a5-7365f97a5b87';
  const feedName = 'packages';
  const pat = process.env.PAT_HENI_FAZZANI_ARTIFACTS;
  const packageName = 'GDrive.Anomalies.Library';
  const packagesPath = path.join(path.dirname(fs.realpathSync(__filename)), 'tests_artifacts');

  it('get should be exist', async () => {
    const pkg = await PackageAPI.getVersionByName({
      org,
      pat,
      feedName: feedId,
      packageName,
      packageVersion: '1.3.5',
    });
    // tslint:disable-next-line: no-unused-expression
    expect(pkg).to.exist;
    // tslint:disable-next-line: no-unused-expression
    expect(pkg!.name).to.exist;
  });

  it('get should be not exist', async () => {
    const feed = await FeedAPI.findByName({ org, pat, feedName });

    const pkg = await PackageAPI.getVersionByName({
      org,
      pat,
      feedName: feed.id,
      packageName,
      packageVersion: '2.2.2',
    });
    // tslint:disable-next-line: no-unused-expression
    expect(pkg).to.not.exist;
  });

  it('promote should success', async () => {
    const promoted = await PackageAPI.promote({
      org,
      pat,
      feedId,
      packageName,
      packageVersion: '1.3.2',
    });
    // tslint:disable-next-line: no-unused-expression
    expect(promoted).to.be.true;
  });

  it('findByName should success', async () => {
    const feed = await FeedAPI.findByName({ org, pat, feedName });
    const pkg = await PackageAPI.findByName({ org, pat, feedId: feed.id, packageName });
    // tslint:disable-next-line: no-unused-expression
    expect(pkg).to.exist;
    // tslint:disable-next-line: no-unused-expression
    expect(pkg!.name).to.eq(packageName);
  });

  it('getInfo nuget should success', async () => {
    const pkg = await PackageAPI.getInfo({
      filePath: path.join(packagesPath, 'gdrive.anomalies.library.1.0.0-alpha0024-1224.nupkg'),
    });
    // tslint:disable-next-line: no-unused-expression
    expect(pkg).to.exist;
    expect(pkg!.name.toLowerCase()).to.eq('gdrive.anomalies.library');
    expect(pkg!.version).to.contains('1.0.0-alpha0024-1224');
  });

  it('getInfo npm should success', async () => {
    const pkg = await PackageAPI.getInfo({
      filePath: path.join(packagesPath, 'package.json'),
      type: ProtocolType.Npm,
    });
    // tslint:disable-next-line: no-unused-expression
    expect(pkg).to.exist;
    expect(pkg!.version).to.eq('1.1.0');
  });
});
