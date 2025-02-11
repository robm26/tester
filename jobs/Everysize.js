
import * as fs from 'node:fs/promises';
import { PutObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3";
import {runJob} from "./jobExec.js";

import config from '../config.json' with { type: 'json' };

const tableNames = ['MREC', 'MRSC'];

const args = process.argv.slice(2);

const operation = args[0] || 'write'; // 'read'

let summary = {
    desc: 'Correlating item size and request latency for MREC and MRSC modes of DynamoDB Global Tables',
    type: 'Line',

    xAxisLabel: 'size',
    xAxisUnits: 'KB',
    xAttribute: 'PK',

    yAxisLabel: 'latency',
    yAxisUnits: 'ms',
    yAttribute: 'latency',

    operation: operation,

    charts: ['LS'], // xy scatter

    itemCount: 400
};


const run = async () => {
    const expName = 'E' + Math.floor(new Date().getTime() / 1000).toString();

    let params;
    let results;

    if(operation === 'write') {

        // *************************** Test MREC writes ***************************

        params = {
            experiment: expName, 
            test: 'MREC everysize writes',
            region: 'us-east-1',
            operation: 'put', 
            targetTable: tableNames[0], 
            items: summary.itemCount, 
            PK: 'PK', SK: 'SK', jobFile: 'load-everysize.js',
            
        };

        results = await runJob(params);
        console.log('put : ' + results.length);
        console.log();

        // *************************** Test MRSC writes ***************************

        params = {
            experiment: expName, 
            test: 'MRSC everysize writes',
            region: 'us-east-1',
            operation: 'put', 
            targetTable: tableNames[1], 
            items: summary.itemCount, 
            PK: 'PK', SK: 'SK', jobFile: 'load-everysize.js',
            
        };

        results = await runJob(params);
        console.log('put : ' + results.length);
        console.log();

    }
    
    if(operation === 'read') {
        // *************************** Test MRSC default reads *****************
    
        params = {
            experiment: expName, 
            test: 'MRSC default reads', 
            operation: 'get',
            strength: 'default', 
            targetTable: tableNames[0], items: summary.itemCount, 
            PK: 'PK', SK: 'SK', jobFile: 'load-everysize.js',
        };
    
        results = await runJob(params);
        console.log('got : ' + params['items']);
        console.log();
        
        // *************************** Test MRSC strong reads *****************
    
        params = {
            experiment: expName, 
            test: 'MRSC strong reads', 
            operation: 'get',
            strength: 'strong', 
            targetTable: tableNames[1], items: summary.itemCount, 
            PK: 'PK', SK: 'SK', jobFile: 'load-everysize.js',
        };
    
        results = await runJob(params);
        console.log('got : ' + params['items']);
        console.log();
    }

    // *************************** Upload to S3 ***************************
    // put folder and file in S3

    const fileData = await fs.readFile( '../public/experiments/' +  params.experiment + '/data.csv', 'utf-8');
    // console.log('\nfileData:\n' + fileData);

    const key = 'exp/' + expName + '/data.csv';
    const keySummary = 'exp/' + expName + '/summary.json';

    const client = new S3Client({});
    let command = null;

    async function uploader(objName, body) {
        // console.log('uploader(' + objName + ')');

        command = new PutObjectCommand({
            Bucket: config.bucket,
            Key: objName,
            Body: body,
        });

        try {
            const response = await client.send(command);
            console.log('uploaded file: s3://' + config.bucket + '/' + objName);
            // console.log('HTTP ' + response.$metadata.httpStatusCode + ' for s3://' + bucketName + '/' + key);
        } catch (caught) {  
            console.error(JSON.stringify(caught, null, 2));
        }

    }

    const res = await uploader(key, fileData);

    const res2 = await uploader(keySummary, JSON.stringify(summary, null, 2));

}


void run().then(()=>{
    process.exit(1);
});