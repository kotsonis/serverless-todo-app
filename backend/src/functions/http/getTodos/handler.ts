import 'source-map-support/register';
import { middyfy } from '@libs/lambda';
import { createLogger } from '@libs/logger'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from "aws-lambda"

import { getUserId } from '@libs/getUserId';
import {getItems} from '@libs/database'

const logger = createLogger('getTodos')

/**
 * lambda function to retrieve user todo items from db
 * @param event 
 * @returns a JSON with all the items retrieved from db
 */
const getTodos: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    const userId = await getUserId(event);
    logger.info(`Retrieving TODO items for user ${userId}`);
    const todos = await getItems(userId);
    return {
        statusCode: 201,
        body: JSON.stringify({
            items: todos
        })
    };
}

// wrap this handler around the middy middleware
export const main = middyfy(getTodos);