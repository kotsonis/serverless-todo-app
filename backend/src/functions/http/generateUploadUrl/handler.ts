import 'source-map-support/register';
import { middyfy } from '@libs/lambda';
import { createLogger } from '@libs/logger'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from "aws-lambda"
import * as AWS  from 'aws-sdk'
import { getUserId } from '@libs/getUserId';

const logger = createLogger('createTodo')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});
const urlExpiration = +process.env.SIGNED_URL_EXPIRATION

const generateUploadUrl: APIGatewayProxyHandler = async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult>  =>{
  logger.info('Processing event: ', event)
  const user = getUserId(event)
  const todoId = event.pathParameters.todoId
  const validtodoId = await todoExists(todoId, user)

  if (!validtodoId) {
    logger.info(`Got invalid todoId ${todoId} for user ${user}`)
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'TODO item does not exist'
      })
    }
  }
  logger.info(`Found user ${user} and todo item ${todoId}`)

  const revisedTodoItem = updateTodoItem(todoId, user)
  logger.info(`Revised TODO item`, revisedTodoItem)

  const uploadUrl = getUploadUrl(todoId)
  logger.info(`generated upload URL ${uploadUrl}`)
  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  }
}

async function updateTodoItem(user: string, todoId: string) {
  const url = `https://${bucketName}.s3.amazonaws.com/${todoId}`
  var dbParams = {
    TableName: todosTable,
    Key: {
      userId: user,
      todoId: todoId
    },
    UpdateExpression: "set attachmentUrl = :u",
    ExpressionAttributeValues:{
      ":u":url
    },
    ReturnValues:"UPDATED_NEW"
  }
  logger.info('Getting ready to update database with these params')
  logger.info(dbParams)
  const result = await docClient.update(dbParams)
    .promise()
  return result
}
function getUploadUrl(todoId: string) {
  return s3.getSignedUrl(
    'putObject', 
    {
      Bucket: bucketName,
      Key: todoId,
      Expires: urlExpiration
    })
}
async function todoExists(todoItem: string, user: string) {
  const result = await docClient
    .get({
      TableName: todosTable,
      Key: {
        userId: user,
        todoId: todoItem
      }
    })
    .promise()

  logger.info('Get todo Item: ', result)
  return !!result.Item
}

export const main = middyfy(generateUploadUrl);

