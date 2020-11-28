import * as tl from 'azure-pipelines-task-lib/task';
import { PackageAPI } from './packageApi';
import * as url from 'url';

async function run() {
  try {
    const option = readInputs();
    tl.debug(`Inputs: ${JSON.stringify(option)}`);

    const [valid, errors] = validateInputs(option);
    if (!valid) {
      errors.forEach(tl.error);
      tl.setResult(tl.TaskResult.Failed, 'Invalid inputs');
      return 1;
    }

    const pat = tl.getEndpointAuthorizationParameter('SystemVssConnection', 'AccessToken', false);
    tl.debug(`authToken: ${pat}`);

    switch (option.PackageType) {
      case PackageType.nameVersion:
        option.packageIds.forEach(async (pv) => {
          if (
            !(await PackageAPI.promote({
              org: option.TfsUri.org,
              pat,
              feedId: option.feed,
              packageName: pv,
              packageVersion: option.version,
              viewId: option.view,
            }))
          )
            tl.warning(`failing to promote package ${pv} for ignored reason!`);
        });
        break;
      case PackageType.packageFiles:
        option.packagesPatterns.forEach(async (pp) => {
          const pkgInfos = await PackageAPI.getInfo({ patterns: pp, cwd: option.packagesDirectory });
          pkgInfos.forEach(async (pi) => {
            if (
              !(await PackageAPI.promote({
                org: option.TfsUri.org,
                pat,
                feedId: option.feed,
                packageName: pi.name,
                packageVersion: pi.version,
                viewId: option.view,
              }))
            ) {
              tl.warning(`failing to promote package ${pi.name} for ignored reason!`);
            }
          });
        });
        break;
      default:
        tl.warning('not supported package type yet');
        process.exit(1);
    }
  } catch (err) {
    tl.debug(err.message);
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

function validateInputs(option: Option): [boolean, string[]] {
  let valid = true;
  const errors: string[] = [];
  if (option.view === '') {
    valid = false;
    errors.push("Invalid view entry: can't be empty");
  }
  return [valid, errors];
}

function readInputs(): Option {
  const option: Option = new Option();

  option.view = tl.getInput('releaseview', true);
  option.packagesDirectory = tl.getPathInput('packagesdirectory', false);
  option.packagesPatterns = tl.getDelimitedInput('packagespattern', ';', false);
  option.packageIds = tl.getDelimitedInput('packageids', ',', false);
  option.version = tl.getInput('version', false);
  option.type = tl.getInput('inputType', true);
  option.feed = tl.getInput('feed', true);
  option.tfsUri = tl.getVariable('system.teamfoundationserveruri');

  return option;
}

class Option {
  feed: string;
  type: string;
  version: string;
  view: string;
  packageIds?: string[];
  packagesPatterns?: string[];
  packagesDirectory?: string;
  tfsUri: string;
  public get PackageType(): PackageType {
    return this.type === 'nameVersion' ? PackageType.nameVersion : PackageType.packageFiles;
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
