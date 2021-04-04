import { handlerPath } from '@libs/handlerResolver';
import schema from './schema';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "patch",
        path: "todos/{todoId}",
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
  ],
};