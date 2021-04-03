import * as AWS from "aws-sdk";
import { createLogger } from "./logger";

const bucketName = process.env.TODOS_S3_BUCKET;
const urlExpiration = +process.env.SIGNED_URL_EXPIRATION;
const s3 = new AWS.S3({
  signatureVersion: "v4",
});

const logger = createLogger("s3");

export function getUploadUrl(bucketKey: string) {
  return s3.getSignedUrl("putObject", {
    Bucket: bucketName,
    Key: bucketKey,
    Expires: urlExpiration,
  });
}

/**
 * delete a bucket from S3
 * @param bucketKey - the file to delete
 * @returns a Promise
 */
export async function deleteBucket(bucketKey: string) {
  let re = /.*amazonaws\.com\/(.*)/i
  let match = re.exec(bucketKey)
  logger.info(`Extracted ${match.groups[1]} out of ${bucketKey}`)
  var params = {
    Bucket: bucketName,
    Key: match.groups[1],
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
