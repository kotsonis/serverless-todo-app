
import 'source-map-support/register';
import { middyfy } from '@libs/lambda';
import { createLogger } from '@libs/logger'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from "aws-lambda"
import { getUserId } from '@libs/getUserId';
import { getItem , deleteItem} from '@libs/database'
import {deleteBucket} from '@libs/storage'

const logger = createLogger('deleteTodos');

const deleteTodos: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  const user = getUserId(event);
  const todoId = event.pathParameters.todoId;
  logger.info(
    `Request to delete todo item ${todoId} for user ${user} `
  );
  // check if todo item exists
  const todoQuery = await getItem(todoId, user);
  if (todoQuery.Count === 0) {
    logger.info(`Got invalid todoId ${todoId} for user ${user}`);
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: "TODO item does not exist",
      }),
    };
  }

  const todoEntry = todoQuery.Items[0]
  // check if an S3 bucket was created for this item and delete if so

  if (todoEntry.hasOwnProperty('attachmentUrl')) {
    deleteBucket(todoEntry.attachmentUrl)
  }

  // delete the todo entry
  const timestamp = todoEntry.timestamp

  await deleteItem(timestamp, user)
  
  return {
      statusCode: 200,
      body: ''
  }
}

export const main = middyfy(deleteTodos);

