import * as fs from 'node:fs/promises';
import { PutObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3";
import {runJob} from "./lib/jobExec.js";

import config from '../config.json' with { type: 'json' };

const args = process.argv;
const expName = args[1].substring(args[1].lastIndexOf('/')+1);

const expArgs = args.slice(2);
const itemCount = expArgs.length > 0 ? expArgs[0] : 100;

const tableName = 'mytable';
const operation = 'read';

let summary = {
    itemCount: itemCount,

    desc: 'Small item read test, target table mytable',
    type: 'Line',

    xAxisLabel: 'request',
    xAxisUnits: '#',
    xAttribute: 'requestNum',

    yAxisLabel: 'latency',
    yAxisUnits: 'ms',
    yAttribute: 'latency',

    operation: operation,
    expName: expName,
    expArgs: expArgs,

    charts: ['LA','HI'] // latency simple and histogram

};

console.log();
console.log('Experiment Description : ' + summary['desc']);
console.log();

const run = async () => {
    const expName = 'E' + Math.floor(new Date().getTime() / 1000).toString();

    let params;
    let results;

    // *************************** Test small writes ***************************
    params = {
        experiment: expName, 
        test: 'mytable small reads',
        operation: 'get', 
        targetTable: tableName, items: itemCount, 
        PK: 'PK', 
        SK: 'SK', 
        jobFile: 'load-smallitems.js'
        
    };

    results = await runJob(params);
    
    console.log('put : ' + params['items'] + '\n');

    // *************************** Upload to S3 ***************************
    // put folder and file in S3

    const fileData = await fs.readFile( '../public/experiments/' +  params.experiment + '/data.csv', 'utf-8');

    const key = 'exp/' + expName + '/data.csv';
    const keySummary = 'exp/' + expName + '/summary.json';

    const client = new S3Client({});
    let command = null;

    async function uploader(objName, body) {

        command = new PutObjectCommand({
            Bucket: config['bucketName'],
            Key: objName,
            Body: body,
        });

        try {
            const response = await client.send(command);
            console.log('uploaded s3://' + config['bucketName'] + '/' + objName);
            // console.log('HTTP ' + response.$metadata.httpStatusCode + ' for s3://' + bucketName + '/' + key);
        } catch (caught) {
            console.error(JSON.stringify(caught, null, 2));
        }

    }

    const res = await uploader(key, fileData);

    const res2 = await uploader(keySummary, JSON.stringify(summary, null, 2));

    console.log();


};


void run().then(()=>{
    process.exit(1);
});