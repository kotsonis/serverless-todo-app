import type { AWS } from '@serverless/typescript';

import getTodos from '@functions/http/getTodos';
import createTodo from '@functions/http/createTodo';
import generateUploadUrl from '@functions/http/generateUploadUrl'
import auth0Authorizer from '@functions/auth/auth0Authorizer'
import {BucketPolicy, AttachmentsBucket} from '@resources/s3'
import {TodosTable} from '@resources/dynamoDb'
import deleteTodo from '@functions/http/deleteTodo'
import updateTodo from '@functions/http/updateTodo'

const serverlessConfiguration: AWS = {
  service: 'serverless-todo-app',
  variablesResolutionMode: "20210326",
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
    todoSecrets: "${ssm:/aws/reference/secretsmanager/todo/app}",  
  },
  plugins: [
    'serverless-webpack',
    'serverless-iam-roles-per-function'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: "${opt:stage, 'dev'}",
    region: 'eu-central-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      TODOS_TABLE: "${self:custom.todoSecrets.tableName}${self:provider.stage}", 
      TODO_ID_INDEX: "${self:custom.todoSecrets.todoIndex}${self:provider.stage}",
      TODOS_S3_BUCKET: "${self:custom.todoSecrets.s3Endpoint}${self:provider.stage}"

    },
    lambdaHashingVersion: '20201221',
  },
  // import the function via paths
  functions: { 
    getTodos,
    auth0Authorizer,
    createTodo,
    generateUploadUrl,
    deleteTodo,
    updateTodo },
  resources: {
    Resources: {
      TodosTable,
    
    AttachmentsBucket,
    BucketPolicy 
  },
}
};

module.exports = serverlessConfiguration;
