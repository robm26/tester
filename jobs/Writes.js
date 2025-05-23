import * as fs from 'node:fs/promises';
import {runJob} from "./lib/jobExec.js";
import {bucketUploader} from "./lib/s3.js";
import { fileURLToPath } from 'url';
import { URL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const expName = __filename.substring(__filename.lastIndexOf('/')+1);

import config from '../config.json' with { type: 'json' };

const args = process.argv;
let arg1 = args[1].substring(args[1].lastIndexOf('/')+1);
if(arg1.slice(-3) !== '.js') {
    arg1 += '.js';
}

const expArgs = args.slice(2);

// const itemCount = expArgs.length > 0 ? expArgs[0] : 200;
// const tableName = expArgs.length > 1 ? expArgs[1] : 'mytable';

const tableName = 'mytable';
const operation = 'write';

let summary = {

    desc: 'Small item write test, target table mytable',
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

const run = async (req) => {

    const itemCount = req['itemCount'] ? req['itemCount'] : 200;
    const showEachRequest = req['showEachRequest'] ? req['showEachRequest'] : false;
    const waitForMinute = req['waitForMinute'] ? req['waitForMinute'] : true;

    summary['itemCount'] = itemCount;

    const expName = 'E' + Math.floor(new Date().getTime() / 1000).toString();

    let params;
    let results;

    // *************************** Test small writes ***************************
    
    params = {
        experiment: expName, 
        test: 'mytable small writes',
        operation: 'put', 
        targetTable: tableName, 
        items: itemCount, 
        PK: 'PK', 
        SK: 'SK', 
        jobFile: 'load-smallitems.js',

        maxUnitVelocity: 100

    };

    results = await runJob(params);
    
    console.log('\nput : ' + params['items'] + '\n');

    const fileData = await fs.readFile( '../public/experiments/' +  params.experiment + '/data.csv', 'utf-8');

    const key = 'exp/' + expName + '/data.csv';
    const keySummary = 'exp/' + expName + '/summary.json';

    const res = await bucketUploader(config['bucketName'], key, fileData);
    const res2 = await bucketUploader(config['bucketName'], keySummary, JSON.stringify(summary, null, 2));

    console.log();

};


export {run};

// void run().then(()=>{
//     process.exit(1);
// });