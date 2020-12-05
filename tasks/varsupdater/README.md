# Release variable updater

## Overview

This extension enables you to create/update **release** variables in your Azure Pipelines.

## Features

- UpInsert release variables

## Prerequisites

The task used the default 'SystemVssConnection' service endpoint for 'Project Collection Build Service' user account and its must have 'View releases', 'View release definition', 'Create releases' and 'Manage deployments' release pipeline permissions to be able to update release definition .

and You must allow scripts to access OAuth Token

![alt](https://i.imgur.com/bP9kWzM.png)
![alt](https://i.imgur.com/O7cc28Z.png)
![alt](https://i.imgur.com/30BLPG4.png)

Please refer to Azure DevOps permissions and security roles documentation for more details

## References

- [Azure release API](https://docs.microsoft.com/en-us/rest/api/azure/devops/release/definitions/update?view=azure-devops-rest-6.0)
