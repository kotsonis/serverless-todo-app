import 'source-map-support/register';
import { middyfy } from '@libs/lambda';
import { createLogger } from '@libs/logger'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from "aws-lambda"
import * as AWS  from 'aws-sdk'
import { getUserId } from '@libs/getUserId';

const logger = createLogger('getTodos')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

const getTodos: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    const userId = await getUserId(event);
    logger.info(`Retrieving TODO items for user ${userId}`);
    const todos = await getTodosPerUser(userId);
    return {
        statusCode: 201,
        body: JSON.stringify({
            items: todos
        })
    };
}

  async function getTodosPerUser(userId: string) {
    logger.info(`searching in table ${todosTable}`)
    const result = await docClient.query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :user',
      ExpressionAttributeValues: {
        ':user': userId
      },
    }).promise()
    return result.Items
  }

  export const main = middyfy(getTodos);