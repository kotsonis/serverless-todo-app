import 'source-map-support/register';
import { middyfy } from '@libs/lambda';
import { createLogger } from '@libs/logger';
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda";
import { getUserId } from '@libs/getUserId';
import { getItem, updateItemUrl } from '@libs/database';
import { getUploadUrl } from '@libs/storage';
import type { FromSchema } from "json-schema-to-ts";

const logger = createLogger('generateUploadUrl');

// parse the event.body according to schema
import schema from './schema';
type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> };
type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>;

/**
 * lambda function to generate a signedUrl from s3 for client to upload image
 * @param event - which should contain the filename under body.file and todoId in the query
 * @returns a JSON with the signedUrl to which client can upload the image
 */
const generateUploadUrl: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const user = getUserId(event);
  const todoId = event.pathParameters.todoId;
  logger.info(`Request to generate upload URL for user ${user} / todo item ${todoId}`);

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
  const fname = event.body.file;
  const bucketKey = `${todoId}/${fname}`;
  const revisedTodoItem = updateItemUrl(todoEntry.Items[0].timestamp, user,bucketKey);
  logger.info(`Revised TODO item`, revisedTodoItem);
  // get an UploadURL for the client to store the image
  const uploadUrl = getUploadUrl(bucketKey);
  logger.info(`generated upload URL ${uploadUrl}`);

  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  };
};
// wrap this handler around the middy middleware
export const main = middyfy(generateUploadUrl);

