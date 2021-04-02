import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'
import { createLogger } from '@libs/logger'
const logger = createLogger('parseUserId')
/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {

  const decodedJwt = decode(jwtToken) as JwtPayload
  logger.info(`User is: ${decodedJwt.sub}`)
  return decodedJwt.sub
}
