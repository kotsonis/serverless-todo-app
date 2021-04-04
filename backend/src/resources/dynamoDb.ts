/** 
 * AWS DynamoDB table declaration for storing todo Items
 */
const TodosTable = {
      Type: "AWS::DynamoDB::Table",
      Properties: {
        TableName: "${self:provider.environment.TODOS_TABLE}",
        AttributeDefinitions: [
          {
            AttributeName: "userId",
            AttributeType: "S",
          },
          {
            AttributeName: "timestamp",
            AttributeType: "S",
          },
          {
            AttributeName: "todoId",
            AttributeType: "S",
          },
        ],
        KeySchema: [
          {
            AttributeName: "userId",
            KeyType: "HASH",
          },
          {
            AttributeName: "timestamp",
            KeyType: "RANGE",
          },
        ],
        BillingMode: "PAY_PER_REQUEST",
      },
};
export {TodosTable}