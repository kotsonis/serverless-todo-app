/**
 * Creates the serverless functions entry for this function
 * Implements:
 * - request checking versus schema from APIGateway
 * - iamRoles per lambda function
 */
import { handlerPath } from '@libs/handlerResolver';
import schema from './schema';
export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "post",
        path: "todos/{todoId}/attachment",
        cors: true,
        authorizer: "auth0Authorizer",
        request: {
          schema: {
            "application/json": schema,
          },
        },
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: "Allow",
      Action: [
        "dynamodb:UpdateItem",
        "dynamodb:Query",
      ],
      Resource: [
        "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}",
        "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}/index/${self:provider.environment.TODO_ID_INDEX}"
      ],
      
    },
    {
      Effect: 'Allow',
      Action: [
        's3:putObject',
        's3:getObject'
      ],
      Resource: ["arn:aws:s3:::${self:provider.environment.TODOS_S3_BUCKET}/*"]
    },
  ],
};