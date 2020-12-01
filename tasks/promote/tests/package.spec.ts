/* eslint-disable @typescript-eslint/no-unused-expressions */
// import * as ttm from 'azure-pipelines-task-lib/mock-test';
import 'mocha';
import { packageApi, ProtocolType } from '../packageApi';
import { feedApi, } from '../feedApi';
import { expect } from 'chai';
import fs = require('fs');
import path = require('path');

describe('Package Api tests', () => {
  const org = 'henifazzani';
  const project = 'SynkerAPI';
  const feedId = '9a9327ae-8c62-4cc1-80a5-7365f97a5b87';
  const feedName = 'packages';
  const packageName = 'GDrive.Anomalies.Library';
  const packagesPath = path.join(path.dirname(fs.realpathSync(__filename)), 'tests_artifacts');

  it('get should be exist', async () => {
    const pkg = await packageApi.getVersionByName({
      org,
      feedName: feedId,
      packageName,
      packageVersion: '1.3.5',
    });
    expect(pkg).to.exist;
    expect(pkg.name).to.exist;
  });

  it('get should be not exist', async () => {
    const feed = await feedApi.findByName({ org, feedName });

    const pkg = await packageApi.getVersionByName({
      org,
      feedName: feed.id,
      packageName,
      packageVersion: '2.2.2',
    });
    expect(pkg).to.not.exist;
  });

  it('promote should success', async () => {
    const promoted = await packageApi.promote({
      org,
      feedId,
      packageName,
      packageVersion: '1.3.2',
    });
    expect(promoted).to.be.true;
  });

  it('findByName should success', async () => {
    const feed = await feedApi.findByName({ org,  feedName });
    const pkg = await packageApi.findByName({ org,  feedId: feed.id, packageName });
    expect(pkg).to.exist;
    expect(pkg.name).to.eq(packageName);
  });

  it('getInfo nuget should success',  async () => {
    const pkg = await packageApi.getInfo({
      filePath: path.join(packagesPath, 'gdrive.anomalies.library.1.0.0-alpha0024-1224.nupkg'),
    });
    expect(pkg).to.exist;
    expect(pkg.name.toLowerCase()).to.eq('gdrive.anomalies.library');
    expect(pkg.version).to.contains('1.0.0-alpha0024-1224');
  });


  it('getInfo npm tgz file should success', async () => {
    const pkg = await packageApi.getInfo({
      filePath: path.join(packagesPath, 'test-1.0.0.tgz'),
      type: ProtocolType.npm,
    });
    expect(pkg).to.exist;
    expect(pkg.version).to.eq('1.0.0');
  });

  it('getInfo pipy file should success', async () => {
    const pkg = await packageApi.getInfo({
      filePath: path.join(packagesPath, 'python-package-example-0.1.tar.gz'),
      type: ProtocolType.pypi,
    });
    expect(pkg).to.exist;
    expect(pkg.version).to.eq('0.1');
  });
});
