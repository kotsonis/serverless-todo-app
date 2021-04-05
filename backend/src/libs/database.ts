
import * as AWS  from 'aws-sdk'

import { createLogger } from '@libs/logger'
const logger = createLogger('database')
import { captureAWS } from "aws-xray-sdk-core";
var XAWS = captureAWS(AWS);
const docClient = new XAWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
const todoIndex = process.env.TODO_ID_INDEX
const bucketName = process.env.TODOS_S3_BUCKET

export async function createItem(newItem: AWS.DynamoDB.DocumentClient.PutItemInput) {
  const result = await docClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise()
  return result
}

export async function getItems(userId: string) {
  logger.info(`searching in table ${todosTable}`)
  const result = await docClient.query({
    TableName: todosTable,
    KeyConditionExpression: 'userId = :user',
    ExpressionAttributeValues: {
      ':user': userId
    },
  }).promise()
  return result.Items
}

/** Queries the database to find the todo item of the user
 * 
 * @param {string} todoItem - the ID of the todo task
 * @param {string} user - The ID of the user
 * @returns - a DynamoDB QueryOutput promise
 */
export async function getItem(todoItem: string, user: string) {
    const result = await docClient
      .query({
        TableName: todosTable,
        IndexName: todoIndex,
        KeyConditionExpression: "userId = :user and todoId = :id",
        ExpressionAttributeValues: {
          ":user": user,
          ":id": todoItem
        }
      })
      .promise()
  
    logger.info('Got todo Item: ', result)
    return result
  }

/**
 * updates a todo entry with a new URL
 * @param sortKey - the timestamp
 * @param user - the primary key
 * @param bucketKey - name of the file in S3
 */
export async function updateItemUrl(sortKey: string, user: string, bucketKey: string) {
  const url = `https://${bucketName}.s3.amazonaws.com/${bucketKey}`
  
  var dbParams = {
    TableName: todosTable,
    Key: {
      userId: user,
      timestamp: sortKey
    },
    UpdateExpression: "set attachmentUrl = :u",
    ExpressionAttributeValues:{
      ":u":url
    },
    ReturnValues:"UPDATED_NEW"
  }
  logger.info('Getting ready to update database with these params')
  logger.info(dbParams)
  const result = await docClient.update(dbParams)
    .promise()
  return result
}

/**
 * Updates the database entry with new done status
 * @param {string} sortKey  the timestamp
 * @param {string} user  the userId
 * @param {boolean} newStatus the updated status of the todo  
 * @returns 
 */
export async function updateItemStatus(sortKey: string, user: string, newStatus: boolean) {
  var dbParams = {
    TableName: todosTable,
    Key: {
      userId: user,
      timestamp: sortKey
    },
    UpdateExpression: "set done = :newDone",
    ExpressionAttributeValues:{
      ":newDone":newStatus
    },
    ReturnValues:"UPDATED_NEW"
  }
  logger.info('Getting ready to update database with these params')
  logger.info(dbParams)
  const result = await docClient.update(dbParams)
    .promise()
  return result
}

/**
 * delete a todo item from the database
 * @param sortKey - the timestamp
 * @param user - the primary key
 */
export async function deleteItem(sortKey: string, user: string) {
  var dbParams = {
    TableName: todosTable,
    Key: {
      userId: user,
      timestamp: sortKey
    },
    ReturnValues: 'ALL_OLD'
  }
  logger.info('Getting ready to delete database entry with these params')
  logger.info(dbParams)
  const result = await docClient.delete(dbParams)
    .promise()
    .then((data) => {
      logger.info('Deleted entry with following return',data)
    })
    .catch((err) => {
      logger.info('Delete failed with following error',err)
    })
  return result
}