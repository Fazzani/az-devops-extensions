/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
import * as tl from 'azure-pipelines-task-lib/task';
import * as url from 'url';
import * as fg from 'fast-glob';
import {packageApi} from './packageApi';
const run = async (): Promise<void> => {
  try {
    const option = readInputs();
    tl.debug(`Inputs: ${JSON.stringify(option)}`);

    const [valid, errors] = validateInputs(option);
    if (!valid) {
      errors.forEach(tl.error);
      tl.setResult(tl.TaskResult.Failed, 'Invalid inputs');
      return;
    }

    switch (option.packageType) {
      case PackageTypeEnum.nameVersion:
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        option.packageIds.forEach(async (pkgId) => {
          const pkgVersions = await packageApi.get({
            org: option.tfsUri.org,
            feedId: option.feedId,
            packageId: pkgId,
          });
          if (pkgVersions.count === 0) {
            tl.warning(`No package founded with this id: ${pkgId}`);
          } else {
            tl.debug(
              `promoting package ${pkgVersions.value[0].author}:${option.version} into feed ${option.feedId} to view ${option.viewId} from file`,
            );
            if (
              !(await packageApi.promote({
                org: option.tfsUri.org,
                feedId: option.feedId,
                packageName: pkgVersions.value[0].author,
                packageVersion: option.version,
                viewId: option.viewId,
              }))
            )
              tl.warning(`failing to promote package ${pkgId} for ignored reason!`);
          }
        });
        break;
      case PackageTypeEnum.packageFiles:
        const files = await fg(option.packagesPattern, {
          onlyFiles: true,
          followSymbolicLinks: false,
          cwd: option.packagesDirectory,
          absolute: true,
        });

        if (files == null || files.length === 0) {
          tl.setResult(
            tl.TaskResult.SucceededWithIssues,
            `Not matched files with the flowing glob patterns ${JSON.stringify(option.packagesPatterns)}`,
          );
        }

        files.forEach(async (pp) => {
          tl.debug(`Searching with glob ${pp}into folder ${option.packagesDirectory}`);
          const pi =  await packageApi.getInfo({ filePath: pp });
          tl.debug(`promoting package ${pi.name}:${pi.version} into feed ${option.feedId} to view ${option.viewId}`);
          if (
            !(await packageApi.promote({
              org: option.tfsUri.org,
              feedId: option.feedId,
              packageName: pi.name,
              packageVersion: pi.version,
              viewId: option.viewId,
            }))
          ) {
            tl.warning(`failing to promote package ${pi.name} for ignored reason!`);
          }
        });
        break;
      default:
        tl.setResult(tl.TaskResult.Failed, `Not supported package type yet ${option.packageType}`);
    }
  } catch ({ message }) {
    tl.debug(message);
    tl.setResult(tl.TaskResult.Failed, message);
  }
};

const validateInputs = (option: Option): [boolean, string[]] => {
  let valid = true;
  const errors: string[] = [];
  if (option.viewId === '') {
    valid = false;
    errors.push("Invalid view entry: can't be empty");
  }
  return [valid, errors];
};

const readInputs = (): Option => {
  const option: Option = new Option();

  option.viewId = tl.getInput('releaseview', true);
  option.packagesDirectory = tl.getPathInput('packagesdirectory', false);
  option.packagesPattern = tl.getPathInput('packagespattern', false);
  option.packageIds = tl.getDelimitedInput('packageids', ',', false);
  option.version = tl.getInput('version', false);
  option.type = tl.getInput('inputType', true);
  option.feedId = tl.getInput('feed', true);
  option.tfsUrl = tl.getVariable('system.teamfoundationserveruri');

  return option;
};

class Option {
  feedId: string;
  type: string;
  version: string;
  viewId: string;
  packageIds?: string[];
  packagesPattern: string;
  packagesDirectory?: string;
  tfsUrl: string;
  public get packageType(): PackageTypeEnum {
    return this.type === 'nameVersion' ? PackageTypeEnum.nameVersion : PackageTypeEnum.packageFiles;
  }

  public get packagesPatterns(): string[] {
    return this.packagesPattern.split(/^|;/m);
  }
  public get tfsUri(): TfsUri {
    const q = url.parse(this.tfsUrl);
    return { ...q, org: q.pathname.split('/')[1] } as TfsUri;
  }
}

type TfsUri = url.UrlWithStringQuery & { org: string };

enum PackageTypeEnum {
  packageFiles,
  nameVersion,
}

void run();
