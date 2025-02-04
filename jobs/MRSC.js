import * as fs from 'node:fs/promises';
import { PutObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3";
import {runJob} from "./jobExec.js";

import config from '../config.json' with { type: 'json' };

const itemCount = 5000;
const tableNames = ['MREC', 'MRSC'];

const run = async () => {
    const expName = 'E' + Math.floor(new Date().getTime() / 1000).toString();

    let params;
    let results;

     // *************************** Test MREC ***************************
    params = {
        experiment: expName, 
        test: 'Multi Region Eventual Consistency', 
        dbEngine: 'dynamodb',
        targetTable: tableNames[0], items: itemCount, 
        PK: 'PK', SK: 'SK', jobFile: 'load-smallitems.js',
        
    };

    results = await runJob(params);
    console.log('processed: ' + params['items']);
    console.log();

    // *************************** Test MRSC ***************************

    params = {
        experiment: expName, 
        test: 'Multi Region Strong Consistency', 
        dbEngine: 'dynamodb',
        targetTable: tableNames[1], items: itemCount, 
        PK: 'PK', SK: 'SK', jobFile: 'load-smallitems.js',
    };

    results = await runJob(params);
    console.log('processed: ' + params['items']);
    console.log();

    // *************************** Upload to S3 ***************************
       // put folder and file in S3

        const fileData = await fs.readFile( '../public/experiments/' +  params.experiment + '/data.csv', 'utf-8');
        // console.log('\nfileData:\n' + fileData);
  
        const key = 'exp/' + expName + '/data.csv';

        const client = new S3Client({});
        const command = new PutObjectCommand({
            Bucket: config.bucket,
            Key: key,
            Body: fileData,
        });

        try {
            const response = await client.send(command);
            console.log('HTTP ' + response.$metadata.httpStatusCode + ' for s3://' + bucketName + '/' + key);
        } catch (caught) {
            console.error(JSON.stringify(caught, null, 2));
        }

};


void run().then(()=>{
    process.exit(1);
});