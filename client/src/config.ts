// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'jp2dweoip0'
const region = 'eu-central-1'
export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: '...',            // Auth0 domain
  clientId: '...',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
