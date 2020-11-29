import * as tl from 'azure-pipelines-task-lib/task';
import { PackageAPI } from './packageApi';
import * as url from 'url';
import * as fg from 'fast-glob';

async function run() {
  try {
    const option = readInputs();
    tl.debug(`Inputs: ${JSON.stringify(option)}`);

    const [valid, errors] = validateInputs(option);
    if (!valid) {
      errors.forEach(tl.error);
      tl.setResult(tl.TaskResult.Failed, 'Invalid inputs');
      return;
    }

    const pat = tl.getEndpointAuthorizationParameter('SystemVssConnection', 'AccessToken', false);

    switch (option.PackageType) {
      case PackageType.nameVersion:
        option.packageIds.forEach(async (pkgId) => {
          const pkgVersions = await PackageAPI.get({
            org: option.TfsUri.org,
            pat,
            feedId: option.feedId,
            packageId: pkgId,
          });
          if (pkgVersions!.count === 0) {
            tl.warning(`No package founded with this id: ${pkgId}`);
          } else {
            tl.debug(
              `promoting package ${pkgVersions.value[0].author}:${option.version} into feed ${option.feedId} to view ${option.viewId} from file`,
            );
            if (
              !(await PackageAPI.promote({
                org: option.TfsUri.org,
                pat,
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
      case PackageType.packageFiles:
        const files = await fg(option.packagesPattern, {
          onlyFiles: true,
          followSymbolicLinks: false,
          cwd: option.packagesDirectory,
          absolute: true,
        });

        if (files == null || files.length === 0) {
          tl.setResult(
            tl.TaskResult.SucceededWithIssues,
            `Not matched files with the flowing glob patterns ${option.PackagesPatterns}`,
          );
        }

        files.forEach(async (pp) => {
          tl.debug(`Searching with glob ${pp}into folder ${option.packagesDirectory}`);
          const pi = await PackageAPI.getInfo({ filePath: pp });
          tl.debug(`promoting package ${pi.name}:${pi.version} into feed ${option.feedId} to view ${option.viewId}`);
          if (
            !(await PackageAPI.promote({
              org: option.TfsUri.org,
              pat,
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
        tl.setResult(tl.TaskResult.Failed, `Not supported package type yet ${PackageType}`);
    }
  } catch (err) {
    tl.debug(err.message);
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

function validateInputs(option: Option): [boolean, string[]] {
  let valid = true;
  const errors: string[] = [];
  if (option.viewId === '') {
    valid = false;
    errors.push("Invalid view entry: can't be empty");
  }
  return [valid, errors];
}

function readInputs(): Option {
  const option: Option = new Option();

  option.viewId = tl.getInput('releaseview', true);
  option.packagesDirectory = tl.getPathInput('packagesdirectory', false);
  option.packagesPattern = tl.getPathInput('packagespattern', false);
  option.packageIds = tl.getDelimitedInput('packageids', ',', false);
  option.version = tl.getInput('version', false);
  option.type = tl.getInput('inputType', true);
  option.feedId = tl.getInput('feed', true);
  option.tfsUri = tl.getVariable('system.teamfoundationserveruri');

  return option;
}

class Option {
  feedId: string;
  type: string;
  version: string;
  viewId: string;
  packageIds?: string[];
  packagesPattern: string;
  packagesDirectory?: string;
  tfsUri: string;
  public get PackageType(): PackageType {
    return this.type === 'nameVersion' ? PackageType.nameVersion : PackageType.packageFiles;
  }

  public get PackagesPatterns(): string[] {
    return this.packagesPattern.split(/^|;/m);
  }
  public get TfsUri(): TfsUri {
    const q = url.parse(this.tfsUri);
    return { ...q, org: q.pathname.split('/')[1] } as TfsUri;
  }
}

type TfsUri = url.UrlWithStringQuery & { org: string };
enum PackageType {
  packageFiles,
  nameVersion,
}

run();
