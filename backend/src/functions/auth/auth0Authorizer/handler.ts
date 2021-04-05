import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { middyfy } from '@libs/lambda';
import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '@libs/logger'
import { Jwt } from '../../../auth/Jwt'
import { JwtPayload } from '../../../auth/JwtPayload'

//
// request has JWT token in header
// 'Authorization': `Bearer ${idToken}`
//
const jwksClient = require('jwks-rsa');
// TODO: Provide a URL that can be used to download a certificate that can be used
const jwksUrl = process.env.JWKS
const client = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10, // Default value
  jwksUri: jwksUrl
});

const logger = createLogger('auth')

const auth0Authorizer = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info(`User was authorized with token ${jwtToken}`)
    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  if (!jwt || !jwt.header || !jwt.header.kid) {
    throw new Error('invalid token');
  }
  const kid = jwt.header.kid

  const key = await client.getSigningKey(kid);
  const signingKey = key.getPublicKey();
  
  return verify(token, signingKey) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
export const main = middyfy(auth0Authorizer);
