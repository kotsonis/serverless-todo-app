// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'jp2dweoip0'
const region = 'eu-central-1'
export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-34hr4k13.eu.auth0.com',            // Auth0 domain
  clientId: 'sz1ZcHoN0RtLoQJtubM3dNrRLB2uAQzR',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
