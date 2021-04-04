import 'source-map-support/register';
import { middyfy } from '@libs/lambda';
import { createLogger } from '@libs/logger'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"

import { getUserId } from '@libs/getUserId';
import type { FromSchema } from "json-schema-to-ts";
import { getItem, updateItemStatus } from '@libs/database';

const logger = createLogger('createTodo')

import schema from './schema';

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

const updateTodo: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const user = getUserId(event);
  const todoId = event.pathParameters.todoId;
  logger.info(`Request to update todo item ${todoId} for user ${user}`);

  // check if todo item exists
  const todoEntry = await getItem(todoId, user);
  if (todoEntry.Count === 0) {
    logger.info(`Got invalid todoId ${todoId} for user ${user}`);
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'TODO item does not exist'
      })
    }
  }
  // update entry in database with attachment location
  const done = event.body.done;
  const revisedTodoItem = updateItemStatus(todoEntry.Items[0].timestamp, user,done);
  logger.info(`Revised TODO item`, revisedTodoItem);
  // get an UploadURL for the client to store the image

  return {
    statusCode: 201,
    body:''
  };
};
export const main = middyfy(updateTodo);

