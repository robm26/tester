import * as fs from 'node:fs/promises';
import {bucketUploader} from "./lib/s3.js";
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

    // *************************** Test small reads ***************************
    params = {
        experiment: expName, 
        test: 'mytable small reads',
        operation: 'get', 
        targetTable: tableName, items: itemCount, 
        PK: 'PK', 
        SK: 'SK', 
        jobFile: 'load-smallitems.js',

        maxUnitVelocity: 100
        
    };

    results = await runJob(params);
    
    console.log('put : ' + params['items'] + '\n');

    // *************************** Upload to S3 ***************************
    // put folder and file in S3

    const fileData = await fs.readFile( '../public/experiments/' +  params.experiment + '/data.csv', 'utf-8');

    const key = 'exp/' + expName + '/data.csv';
    const keySummary = 'exp/' + expName + '/summary.json';

    const res = await bucketUploader(config['bucketName'], key, fileData);

    const res2 = await bucketUploader(config['bucketName'], keySummary, JSON.stringify(summary, null, 2));

    console.log();


};


void run().then(()=>{
    process.exit(1);
});