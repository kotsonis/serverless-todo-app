import { handlerPath } from '@libs/handlerResolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "post",
        path: "todos/{todoId}/attachment",
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
        "dynamodb:GetItem",
      ],
      Resource: [
        "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}",
      ],
      
    },
    {
      Effect: 'Allow',
      Action: [
        's3:putObject',
        's3:getObject'
      ],
      Resource: ["arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}/*"]
    },
  ],
};