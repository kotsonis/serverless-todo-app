import 'source-map-support/register';
import { middyfy } from '@libs/lambda';
import { createLogger } from '@libs/logger'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from "aws-lambda"
import { getUserId } from '@libs/getUserId';
import {getItems} from '@libs/database'

const logger = createLogger('getTodos')

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


  export const main = middyfy(getTodos);