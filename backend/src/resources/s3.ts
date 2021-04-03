const AttachmentsBucket = {
    Type: "AWS::S3::Bucket",
    Properties: {
      BucketName: "${self:provider.environment.TODOS_S3_BUCKET}",
      CorsConfiguration: {
        CorsRules: [
          {
            AllowedOrigins: ["*"],
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            MaxAge: 3000,
          },
        ],
      },
    },
  };
const BucketPolicy = {
    Type: "AWS::S3::BucketPolicy",
    Properties: {
      Bucket: {
        Ref: "AttachmentsBucket",
      },
      PolicyDocument: {
        Id: "MyPolicy",
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicReadForGetBucketObjects",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: {
              "Fn::Join": [
                "",
                [
                  "arn:aws:s3:::",
                  {
                    Ref: "AttachmentsBucket",
                  },
                  "/*",
                ],
              ],
            },
          },
        ],
      },
    },
  };

  export {BucketPolicy, AttachmentsBucket}