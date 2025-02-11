import { DynamoDBClient, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { ExecuteStatementCommand, DynamoDBDocumentClient, PutCommand, GetCommand} from "@aws-sdk/lib-dynamodb";


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);


const runWarm = async (targetTable, PK, SK) => {
    let key = {}
    key['PK'] = 'warm';
    if(SK) {
        key['SK'] = 'warm';
    }
    const command = new GetCommand({
        TableName: targetTable,
        Key: key
    });
    
    const response = await docClient.send(command);
    return response;

};


const runPut = async (targetTable, item) => {

    let latency = 0;
    let response;
    let timeStart;
    let timeEnd;
    let operation = 'put';

    const input = {
        "Item": item,
        "ReturnConsumedCapacity": "TOTAL",
        "TableName": targetTable
    };

    const command = new PutCommand(input);

    try {
        timeStart = new Date();
        response = await docClient.send(command);
        
    } catch (error) {

        console.error('Error:\n' + JSON.stringify(error, null, 2));
        timeEnd = new Date();
        latency = timeEnd - timeStart;

        const errorSummary = {
            error: {
                code: error.$metadata.httpStatusCode,
                name: error.name,
                // fault: error.$fault,
                // httpStatusCode: error.$metadata.httpStatusCode,
                requestId: error.$metadata.requestId,
                attempts: error.$metadata.attempts,
                totalRetryDelay: error.$metadata.totalRetryDelay,
                Item: JSON.stringify(item)
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

const runGet = async (targetTable, key, strength) => {

    let latency = 0;
    let response;
    let timeStart;
    let timeEnd;
    let operation = 'get';


    let input = {
        "Key": key,
        "ReturnConsumedCapacity": "TOTAL",
        "TableName": targetTable,
        "ConsistentRead": strength === 'strong' ? 'True' : 'False'
    };


    const command = new GetCommand(input);

    try {
        timeStart = new Date();
        response = await docClient.send(command);

        // console.log('got item ' + JSON.stringify(response, null, 2));

        
    } catch (error) {

        console.error('Error:\n' + JSON.stringify(error, null, 2));
        timeEnd = new Date();
        latency = timeEnd - timeStart;

        const errorSummary = {
            error: {
                code: error.$metadata.httpStatusCode,
                name: error.name,
                // fault: error.$fault,
                // httpStatusCode: error.$metadata.httpStatusCode,
                requestId: error.$metadata.requestId,
                attempts: error.$metadata.attempts,
                totalRetryDelay: error.$metadata.totalRetryDelay,
                Item: JSON.stringify(item)
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


export { runPut, runGet, runWarm };

