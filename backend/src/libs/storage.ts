import * as AWS from "aws-sdk";
import { createLogger } from "./logger";

// get bucket Name from serverless ENV (which got it from AWS Secrets Manager)
const bucketName = process.env.TODOS_S3_BUCKET;
const urlExpiration = 900; //use default of 900 seconds, which means 15 minutes window to upload the file
const s3 = new AWS.S3({
  signatureVersion: "v4",
});

const logger = createLogger("s3");

/**
 * get a signed URL from s3 to upload an item
 * @param bucketKey 
 * @returns an http address to upload the item
 */
export function getUploadUrl(bucketKey: string) {
  return s3.getSignedUrl("putObject", {
    Bucket: bucketName,
    Key: bucketKey,
    Expires: urlExpiration,
  });
}

/**
 * delete a bucket from S3
 * @param attachmentUrl - the file to delete
 * @returns a Promise
 */
export async function deleteBucket(attachmentUrl: string) {
  let re = /.*amazonaws\.com\/(.*)/i
  let match = re.exec(attachmentUrl)
  logger.info('Getting ready to delete bucket',match)
  logger.info(`Extracted ${match[1]} out of ${attachmentUrl}`)
  var params = {
    Bucket: bucketName,
    Key: match[1],
  };
  const result = await s3
    .deleteObject(params)
    .promise()
    .then((data) => {
      logger.info("Bucket deleted", data);
    })
    .catch((err) => {
      logger.info("Error in deleting Bucket", err);
    });

  return result;
}
