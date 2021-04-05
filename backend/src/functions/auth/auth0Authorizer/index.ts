/**
 * Creates the serverless functions entry for this function
 */
import { handlerPath } from '@libs/handlerResolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
}