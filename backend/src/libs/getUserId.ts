import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";
import { createLogger } from '@libs/logger'
const logger = createLogger('getUserId')

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  logger.info(`Got authorization ${authorization}`)
  const split = authorization.split(' ')
  const jwtToken = split[1]
  return parseUserId(jwtToken)
}