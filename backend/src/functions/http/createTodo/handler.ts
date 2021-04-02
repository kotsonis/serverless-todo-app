import 'source-map-support/register';
import { middyfy } from '@libs/lambda';
import { createLogger } from '@libs/logger'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from "aws-lambda"
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import { getUserId } from '@libs/getUserId';

const logger = createLogger('createTodo')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

import { CreateTodoRequest } from '@interfaces/CreateTodoRequest'


const createTodo: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const id = uuid.v4()
  const user = getUserId(event)
  const parsedBody: CreateTodoRequest = JSON.parse(event.body)

  const newItem = {
    userId: user,
    todoId: id,
    ...parsedBody
  }
  logger.info('Ready to add item: ', newItem)
  
  await docClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise()

  return {
    statusCode: 201,
    body: JSON.stringify({
      newItem
    })
  }
}

export const main = middyfy(createTodo);

