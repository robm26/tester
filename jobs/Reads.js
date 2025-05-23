import * as fs from 'node:fs/promises';
import {bucketUploader} from "./lib/s3.js";
import {runJob} from "./lib/jobExec.js";
import { fileURLToPath } from 'url';
import { URL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const expName = __filename.substring(__filename.lastIndexOf('/')+1);

// import config from '../config.json' with { type: 'json' };

const args = process.argv;
let arg1 = args[1].substring(args[1].lastIndexOf('/')+1);
if(arg1.slice(-3) !== '.js') {
    arg1 += '.js';
}

const expArgs = args.slice(2);

const tableName = 'mytable';
const operation = 'read';

console.log('Experiment Name : ' + expName);

let summary = {

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

const run = async (req) => {

    const itemCount = req['itemCount'] ? req['itemCount'] : 200;
    const showEachRequest = req['showEachRequest'] ? req['showEachRequest'] : false;
    const waitForMinute = req['waitForMinute'] ? req['waitForMinute'] : true;
    const bucketName = req['bucketName'];

    summary['itemCount'] = itemCount;

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

        maxUnitVelocity: 100,
        showEachRequest: showEachRequest,
        waitForMinute: waitForMinute
        
    };

    // console.log(JSON.stringify(params, null, 2));

    results = await runJob(params);
    
    console.log('put : ' + params['items'] + '\n');

    // *************************** Upload to S3 ***************************
    // put folder and file in S3

    // const fileData = await fs.readFile( './public/experiments/' +  params.experiment + '/data.csv', 'utf-8');
    const fileData = await fs.readFile( '/tmp/' +  params.experiment + '/data.csv', 'utf-8');


    const key = 'exp/' + expName + '/data.csv';
    const keySummary = 'exp/' + expName + '/summary.json';

    const res = await bucketUploader(bucketName, key, fileData);

    const res2 = await bucketUploader(bucketName, keySummary, JSON.stringify(summary, null, 2));

    console.log();

    return results;


};

export {run};

// if(expName === arg1) {
//     void run().then(()=>{
//         process.exit(1);
//     });
// }
