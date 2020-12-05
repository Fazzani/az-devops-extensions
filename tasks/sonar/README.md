# Azure Devops Tasks

[![Build Status](https://dev.azure.com/henifazzani/SynkerAPI/_apis/build/status/az-tasks-ci?branchName=main)](https://dev.azure.com/henifazzani/SynkerAPI/_build/latest?definitionId=27&branchName=main1)

## Publishing tasks

```shell

# nb: version must be incremented into those files task.json and vss-extension.json

npm i -g tfx-cli
./publish.sh
```

## Azure devops extensions

- SonarCloud project management
  - Create/Delete sonarcloud project

## TODO

- [ ] Sonar api unit tests
- [ ] Task Versioning
- [x] Add new build to publish extension
- [x] Using service connection
- [x] Test build

## Dev links

- [Microsoft extensions marketplace admin](https://marketplace.visualstudio.com/manage/publishers/synker)
- [Azure devops extensions admin](https://dev.azure.com/henifazzani/_settings/extensions?tab=installed)
- [Azure devops pipeline test](https://dev.azure.com/henifazzani/SynkerAPI/_build?definitionId=26&_a=summary)
- [Sonar Api](https://sonarcloud.io/web_api/api/projects)
- [Hub example](https://github.com/Mimeo/VSTSExtension-ActivePullRequests)

## References

https://kasunkodagoda.com/2017/08/05/building-custom-visual-studio-team-service-tasks-with-vsts-devops-task-sdk/

https://damienaicheh.github.io/azure/devops/2020/01/16/quick-tips-when-developing-and-publishing-extensions-for-azure-devops-en.html

https://docs.microsoft.com/en-us/azure/devops/pipelines/scripts/logging-commands?view=azure-devops&tabs=bash