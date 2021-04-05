/**
 * Creates the serverless functions entry for this function
 * Implements:
 * - iamRoles per lambda function
 */
import { handlerPath } from '@libs/handlerResolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'todos',
        cors: true,
        authorizer: 'auth0Authorizer'
      }
    }
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
        Action: [
          'dynamodb:Query',
        ],
        Resource: ["arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}"]
    }
  ]
}