# Azure Devops Promote Artifacts Task

[![Build Status](https://dev.azure.com/henifazzani/SynkerAPI/_apis/build/status/Fazzani.az-task-promote?branchName=main)](https://dev.azure.com/henifazzani/SynkerAPI/_build/latest?definitionId=29&branchName=main)

Azure devops auto promote packages (nuget, npm) task

## TODO

- [ ] npm task test (see: success.ts)
- [ ] add sonar extension to the solution
- [ ] Enhance documentation (readme.md)
- [ ] Supporting Maven and universal
- [x] Npm package support
- [x] Pipy support
- [x] Nuget support
- [x] Enhance az pipelines deployment only from master

## References

- [Promote Task with PS](https://github.com/renevanosnabrugge/vsts-promotepackage-task)
- [Artifacts rest API](https://docs.microsoft.com/en-us/rest/api/azure/devops/artifactspackagetypes/nuget/update%20package%20version?view=azure-devops-rest-6.0#jsonpatchoperation)
- <https://docs.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops>
- [Samples](https://github.com/microsoft/azure-devops-extension-sample)
- [Samples 2](https://github.com/microsoft/azure-devops-extension-tasks)
