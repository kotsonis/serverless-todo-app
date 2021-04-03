import { handlerPath } from '@libs/handlerResolver';
export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "delete",
        path: "todos/{todoId}",
        cors: true,
        authorizer: "auth0Authorizer",
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: "Allow",
      Action: [
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Delete"
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
        's3:getObject',
        's3:DeleteObject'
      ],
      Resource: ["arn:aws:s3:::${self:provider.environment.TODOS_S3_BUCKET}/*"]
    },
  ],
};