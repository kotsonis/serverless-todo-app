import type { AWS } from '@serverless/typescript';

import getTodos from '@functions/http/getTodos';
import auth0Authorizer from '@functions/auth/auth0Authorizer'
// import todosTable from 'src/resources/dynamoDb'

const serverlessConfiguration: AWS = {
  service: 'serverless-todo-app',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: [
    'serverless-webpack',
    'serverless-iam-roles-per-function'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    profile: 'serverless',
    stage: "${opt:stage, 'dev'}",
    region: 'eu-central-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      TODOS_TABLE: "Todos-${self:provider.stage}", 
      TODO_ID_INDEX: "Todo-index${self:provider.stage}"
    },
    lambdaHashingVersion: '20201221',
  },
  // import the function via paths
  functions: { 
    getTodos,
    auth0Authorizer },
  resources: {
    Resources: {
      TodosTable: {
      Type: "AWS::DynamoDB::Table",
      Properties: {
        TableName: "${self:provider.environment.TODOS_TABLE}",
        AttributeDefinitions: [
          {
            AttributeName: "userId",
            AttributeType: "S",
          },
          {
            AttributeName: "timestamp",
            AttributeType: "S",
          },
          {
            AttributeName: "todoId",
            AttributeType: "S",
          },
        ],
        KeySchema: [
          {
            AttributeName: "userId",
            KeyType: "HASH",
          },
          {
            AttributeName: "timestamp",
            KeyType: "RANGE",
          },
        ],
        BillingMode: "PAY_PER_REQUEST",
        LocalSecondaryIndexes: [
          {
            IndexName: "${self:provider.environment.TODO_ID_INDEX}",
            KeySchema: [
              {
                AttributeName: "userId",
                KeyType: "HASH",
              },
              {
                AttributeName: "todoId",
                KeyType: "RANGE",
              },
            ],
            Projection: {
              ProjectionType: "ALL",
            },
          },
        ],
      },
    }
  },
}
};

module.exports = serverlessConfiguration;
