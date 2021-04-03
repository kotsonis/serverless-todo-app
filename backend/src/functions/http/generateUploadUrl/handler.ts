import 'source-map-support/register';
import { middyfy } from '@libs/lambda';
import { createLogger } from '@libs/logger'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import * as AWS  from 'aws-sdk'
import { getUserId } from '@libs/getUserId';
import type { FromSchema } from "json-schema-to-ts";

const logger = createLogger('generateUploadUrl')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const todoIndex = process.env.TODO_ID_INDEX
const bucketName = process.env.TODOS_S3_BUCKET
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});
const urlExpiration = +process.env.SIGNED_URL_EXPIRATION
import schema from './schema';
type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

const generateUploadUrl: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  logger.info('Processing event: ', event)
  const user = getUserId(event)
  const todoId = event.pathParameters.todoId
  logger.info(`Ready to generate upload URL for item ${todoId}`)
  const todoEntry = await todoExists(todoId, user)
  const fname = event.body.file

  if (todoEntry.Count === 0) {
    logger.info(`Got invalid todoId ${todoId} for user ${user}`)
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'TODO item does not exist'
      })
    }
  }
  const bucketKey = `${todoId}/${fname}`
  logger.info(`Found user ${user} and todo item ${todoId}`)

  const revisedTodoItem = updateTodoItem(todoEntry.Items[0].timestamp, user,bucketKey)
  logger.info(`Revised TODO item`, revisedTodoItem)

  const uploadUrl = getUploadUrl(bucketKey)
  logger.info(`generated upload URL ${uploadUrl}`)
  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  }
}

async function updateTodoItem(sortKey: string, user: string, bucketKey: string) {
  const url = `https://${bucketName}.s3.amazonaws.com/${bucketKey}`
  var dbParams = {
    TableName: todosTable,
    Key: {
      userId: user,
      timestamp: sortKey
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
function getUploadUrl(bucketKey: string) {
  return s3.getSignedUrl(
    'putObject', 
    {
      Bucket: bucketName,
      Key: bucketKey,
      Expires: urlExpiration
    })
}
async function todoExists(todoItem: string, user: string) {
  const result = await docClient
    .query({
      TableName: todosTable,
      IndexName: todoIndex,
      KeyConditionExpression: "userId = :user and todoId = :id",
      ExpressionAttributeValues: {
        ":user": user,
        ":id": todoItem
      }
    })
    .promise()

  logger.info('Got todo Item: ', result)
  return result
}

export const main = middyfy(generateUploadUrl);

