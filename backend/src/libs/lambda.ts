import middy from "@middy/core"
import middyJsonBodyParser from "@middy/http-json-body-parser"
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'

/**
 * Middleware wrapper, to wrap JsonBodyParser, httpErrorHandler, and CORS allow-origin to a lambda function
 * @param handler 
 */
export const middyfy = (handler) => {
  return middy(handler)
         .use(middyJsonBodyParser())
         .use(httpErrorHandler())
         .use(cors())
}
