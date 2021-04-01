# Project Steps
This file documents the steps taken to code and deploy this project

## Create project on GitHub
1. Empty `node` project created on github and cloned into development machine

## Install Serverless framework
```runas /user:DESKTOP-DAD\stefa npm i -g serverless```
## create empty serverless project
Create an empty serverless project using the `aws-nodejs-typescript` template
`sls create --template aws-nodejs-typescript --name serverless-todo-app`
## add your aws information to serverless.ts
```typescript
 provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    profile: 'serverless',
    stage: "${opt:stage, 'dev'}",
    region: "${opt:region, 'eu-central-1'}",
```
## set up source directory structure

```
.
└── src
    ├── functions               # Lambda configuration and source code folder
    │   ├── http                # functions + configurations for HTTP
    │   ├── dynamoDB            # functions + configurations for dynamoDB/elasticsearch
    │   ├── websocket           # functions + configurations for websockets
    │   └── auth                # functions + configurations for auth0 events
    │
    └── libs                    # Lambda shared code
        └── apiGateway.ts       # API Gateway specific helpers
        └── handlerResolver.ts  # Sharable library for resolving lambda handlers
        └── lambda.ts           # Lambda middleware

```
