import * as fs from 'node:fs/promises';
import { PutObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3";
import {runJob} from "./jobExec.js";

import config from '../config.json' with { type: 'json' };

const tableNames = ['MREC', 'MRSC'];
const args = process.argv;

const operation = args[2] || 'write';

let summary = {
    desc: 'Comparing small item request latency for MREC and MRSC modes of DynamoDB Global Tables',
    type: 'Line',

    xAxisLabel: 'request',
    xAxisUnits: '#',
    xAttribute: 'requestNum',

    yAxisLabel: 'latency',
    yAxisUnits: 'ms',
    yAttribute: 'latency',

    operation: operation,

    charts: ['LA','HI'], // latency simple and histogram

    itemCount: 500
};


const run = async () => {
    const expName = 'E' + Math.floor(new Date().getTime() / 1000).toString();

    let params;
    let results;

    //  // *************************** Test MREC writes ***************************
    params = {
        experiment: expName, 
        test: 'MREC writes',
        operation: 'put', 
        targetTable: tableNames[0], items: summary.itemCount, 
        PK: 'PK', SK: 'SK', jobFile: 'load-smallitems.js',
        
    };

    results = await runJob(params);
    console.log('put : ' + params['items']);
    console.log();

    // // *************************** Test MRSC writes ***************************

    params = {
        experiment: expName, 
        test: 'MRSC writes',  
        operation: 'put',   
        targetTable: tableNames[1], items: summary.itemCount, 
        PK: 'PK', SK: 'SK', jobFile: 'load-smallitems.js',
    };

    results = await runJob(params);
    console.log('put : ' + params['items']);
    console.log();

    // *************************** Test MRSC default reads *****************

    params = {
        experiment: expName, 
        test: 'MRSC default reads', 
        operation: 'get',
        strength: 'default', 
        targetTable: tableNames[1], items: summary.itemCount, 
        PK: 'PK', SK: 'SK', jobFile: 'load-smallitems.js',
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
        PK: 'PK', SK: 'SK', jobFile: 'load-smallitems.js',
    };

    results = await runJob(params);
    console.log('got : ' + params['items']);
    console.log();





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
            console.log('uploaded s3://' + config.bucket + '/' + objName);
            // console.log('HTTP ' + response.$metadata.httpStatusCode + ' for s3://' + bucketName + '/' + key);
        } catch (caught) {
            console.error(JSON.stringify(caught, null, 2));
        }

    }

    const res = await uploader(key, fileData);

    const res2 = await uploader(keySummary, JSON.stringify(summary, null, 2));


};


void run().then(()=>{
    process.exit(1);
});