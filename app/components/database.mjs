import mysql2 from "mysql2/promise";
import mysql from "mysql2";

import {config} from "./mysql-credentials.mjs";

import { S3Client, ListObjectsV2Command, S3ServiceException, GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";

import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {ExecuteStatementCommand, DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const pool = mysql.createPool(config);
const mysqlPool = pool.promise();

const listBucketFolders = async (bucketName) => {
    const s3Client = new S3Client({});
    const listParams = {
        Bucket: bucketName,
        Prefix: 'exp/',
        Delimiter: 'i',
    };  

    try {
        const data = await s3Client.send(new ListObjectsV2Command(listParams));
        if(!data || !data['Contents'] || data['Contents'].length === 0) {
            return [];
        } else {
            return data['Contents'].map((x) => x.Key).map((x) => x.split('/')[1]).reverse();
        }
        

    } catch (error) {
        console.log('Error', error);
    }
}
const getObject = async (bucketName, key) => {
    console.log('getObject: \nbucketName:' + bucketName + '\nkey: ' + key + '\n');
    const client = new S3Client({});
    const command = new GetObjectCommand({  Bucket: bucketName, Key: key });
    try {
        const response = await client.send(command);
        const body = await response.Body.transformToString();
        return body;
    } catch (error) {
        console.log('Error', error);
    }    
};

const runPartiQL = async (sql) => {

    let revisedSql = sql;

    let latency = 0;
    let response;
    let timeStart;
    let timeEnd;

    let operation = (sql).trim().split(" ")[0].toLowerCase();
    let statementParams = [];
    let sqlDocString;

    if(operation === 'insert') {

        if(sql.length > 0) {
            let newDoc = {};
            let sqlInsertPart = sql.slice(0, sql.search('VALUE'));

            sqlDocString = sql.slice(sql.search('VALUE') + 6, sql.lastIndexOf(';'));

            let sqlDoc = JSON.parse(sqlDocString.replaceAll("'", "\""));
            let docKeys = Object.keys(sqlDoc);

            revisedSql = sqlInsertPart + 'VALUE {' + docKeys.map((key, index) => {
                statementParams.push(sqlDoc[key]);
                return "'" +  key + "':?";
            }) + '};';
        }
    }
    let cParams = {
        Statement: revisedSql,
        ConsistentRead: false,
        ReturnConsumedCapacity: "TOTAL"
    };
    if(statementParams.length > 0) {
        cParams['Parameters'] = statementParams;
    }

    let command = new ExecuteStatementCommand(cParams);

    try{
        timeStart = new Date();
        response = await docClient.send(command);

    }  catch (error) {
        timeEnd = new Date();
        latency = timeEnd - timeStart;

        if(sqlDocString?.length > 100) {
            sqlDocString = sqlDocString.slice(0, 100) + ' ...';
        }

        const errorSummary = {
            error: {
                code: error.$metadata.httpStatusCode,
                name: error.name,
                // fault: error.$fault,
                // httpStatusCode: error.$metadata.httpStatusCode,
                requestId: error.$metadata.requestId,
                attempts: error.$metadata.attempts,
                totalRetryDelay: error.$metadata.totalRetryDelay,
                Item: sqlDocString
            },
            affectedRows: 0
        };
        console.error(JSON.stringify(errorSummary, null, 2));

        return({result:errorSummary, latency:latency, operation: operation});
    }

    timeEnd = new Date();
    latency = timeEnd - timeStart;

    response['affectedRows'] = 1;

    return({result:response, latency:latency, operation: operation});

};

const runSql = async (sql) => {

    // let result;
    // let timeStart;
    // let timeEnd;
    // let latency = 0;
    // let operation = (sql).trim().split(" ")[0].toLowerCase();

    // try {

    //     timeStart = new Date();
    //     const [rows] = await mysqlPool.query(sql);  // uses a pool connection and auto-releases it

    //     timeEnd = new Date();
    //     latency = timeEnd - timeStart;

    //     if(Array.isArray(rows)) {
    //         result = {'Items': rows};
    //     } else {
    //         result = rows;
    //     }

    // }  catch (error) {
    //     timeEnd = new Date();
    //     latency = timeEnd - timeStart;
    //     console.log(JSON.stringify(error, null, 2));
    //     result = {
    //         error:error
    //     };
    // }

    // return({result:result, latency:latency, operation: operation});
}


export { runSql, runPartiQL, listBucketFolders, getObject};

