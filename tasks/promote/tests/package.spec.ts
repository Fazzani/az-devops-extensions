// import * as ttm from 'azure-pipelines-task-lib/mock-test';
import 'mocha';
import { PackageAPI, ProtocolType } from '../packageApi';
import { FeedAPI } from '../feedApi';
import { expect } from 'chai';
import fs = require('fs');
import path = require('path');

describe('Package Api tests', () => {
  const org = 'henifazzani';
  const project = 'SynkerAPI';
  const feedName = 'packages';
  const pat = process.env.PAT_HENI_FAZZANI_ARTIFACTS;
  const packageName = 'GDrive.Anomalies.Library';
  const packagesPath = path.join(path.dirname(fs.realpathSync(__filename)), 'tests_artifacts');

  it('get should be not undefined', async () => {
    const feed = await FeedAPI.findByName(org, undefined, pat, feedName);

    const pkg = await PackageAPI.getVersionByName(org, undefined, pat, feed.id, packageName, '1.3.5');
    // tslint:disable-next-line: no-unused-expression
    expect(pkg).to.be.not.undefined;
    // tslint:disable-next-line: no-unused-expression
    expect(pkg.name).to.be.not.undefined;
  });

  it('get should be undefined', async () => {
    const feed = await FeedAPI.findByName(org, undefined, pat, feedName);

    const pkg = await PackageAPI.getVersionByName(org, undefined, pat, feed.id, packageName, '2.2.2');
    // tslint:disable-next-line: no-unused-expression
    expect(pkg).to.be.undefined;
  });

  it('promote should success', async () => {
    const feed = await FeedAPI.findByName(org, undefined, pat, feedName);
    const promoted = await PackageAPI.promote({
      org,
      project: undefined,
      pat,
      feedId: feed.id,
      packageName,
      packageVersion: '1.3.2',
    });
    // tslint:disable-next-line: no-unused-expression
    expect(promoted).to.be.eq(true);
  });

  it('findByName should success', async () => {
    const feed = await FeedAPI.findByName(org, undefined, pat, feedName);
    const pkg = await PackageAPI.findByName(org, undefined, pat, feed.id, packageName);
    // tslint:disable-next-line: no-unused-expression
    expect(pkg).to.be.not.undefined;
    // tslint:disable-next-line: no-unused-expression
    expect(pkg.name).to.be.eq(packageName);
  });

  it('getInfo nuget should success', async () => {
    const packages = await PackageAPI.getInfo({ patterns: '**/*.nupkg', cwd: packagesPath });
    expect(packages.length).to.eq(3);
    expect(packages[0].name.toLowerCase()).to.be.eq('gdrive.anomalies.library');
    expect(packages.map((p) => p.version)).to.be.contains('1.0.0-alpha0024-1224');
  });

  it('getInfo npm should success', async () => {
    const packages = await PackageAPI.getInfo({ patterns: '**/*.json', cwd: packagesPath, type: ProtocolType.Npm });
    expect(packages.length).to.eq(2);
    expect(packages.map((p) => p.version)).to.be.contains('2.2.0');
  });
});
