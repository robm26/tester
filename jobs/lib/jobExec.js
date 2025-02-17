import * as fs from 'node:fs/promises';
import { runPut, runGet, runWarm } from "./database.js";

const experimentResultsRoot = 'public/experiments';

const currentPath = process.cwd().split('/');
const currentFolder = currentPath.slice(-1)[0];

let pathToJobsFolder = '../';

let pathToExperimentsFolder = '../' + experimentResultsRoot + '/';
if(currentFolder === 'jobs') {
    pathToExperimentsFolder = '../' + experimentResultsRoot + '/';
}

const runJob = async (params) => {

    const expName = params['expName'] || null;
    const experiment = params['experiment'];
    const test = params['test'];
    const dbEngine = 'dynamodb';
    const targetTable = params['targetTable'];
    const items = params['items'];
    const PK = params['PK'];
    const SK = params['SK'] || null;
    const operation = params['operation'];
    const strength = params['strength'] || null;
    const region = params['region'];
    const conditionalWrite = params['conditionalWrite'] || 'false';
    
    console.log('Job parameters :\n' + JSON.stringify(params, null, 2));

    const jobFile = params['jobFile'];

    const jobFileNameImport = pathToJobsFolder + '/rowmaker/' + jobFile;

    const job = await import(jobFileNameImport);
    const jobInfo = job.jobInformation();
    const jobResults = [];
    let nowMs;
    let nowSec;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    let jobSecond = 0;
    let previousJobSecond = 1;
    let jobTimestamp = 0;
    let jobTimestampMs = 0;
    let jobElapsed = 0;
    let requestsThisSecond = 0;

    const warmed = await runWarm(targetTable, PK, SK);

    let startMs = Date.now();
    const startSec = Math.floor(startMs/1000);
    const msUntilNextSec = 1000 - (startMs - (startSec * 1000));

    await sleep(msUntilNextSec);

    startMs = Date.now();
    let rowSummary = {};
    let newSecond = false;

    if(jobInfo.jobType.toUpperCase() === 'INSERT') {
        const rowLimit = 100000000;
        const loopLimit = Math.min(rowLimit, items);

        for(let rowNum = 1; rowNum <= loopLimit; rowNum++){

            let httpStatusCode;
            let attempts; // aws sdk retry stat
            const nowNow = Date.now();
            jobTimestamp = Math.floor(nowNow/1000);
            jobTimestampMs = nowNow - (jobTimestamp * 1000);
            jobElapsed = nowNow - startMs;

            nowSec = Math.floor(nowNow/1000);
            jobSecond = nowSec - startSec;
            if (jobSecond === previousJobSecond) {
                newSecond = false;
                requestsThisSecond += 1;

                if(rowNum > 1) {
                    jobResults.push(rowSummary); // previous loop's summary here
                }

            } else {
                newSecond = true;
         
                // we detected a new second. Emit the previous loop's summary with last second's stats
                // console.log('Second : ' + jobSecond-1 + ' requests: ' + rowSummary['velocity']);
                
                rowSummary['velocity'] = requestsThisSecond;

                console.log('Second : ' + (jobSecond-1) + ' requests: ' + requestsThisSecond);
                
                if(rowNum > 1) {
                    jobResults.push(rowSummary);
                }

                requestsThisSecond = 1;
                previousJobSecond = jobSecond;
            }  

            const row = job.rowMaker(rowNum);  // ***** crux of the job system

            const pkValue = row[PK];
            const skValue = row[SK];

            let rowResult;

            try {
                if(operation === 'put') {
                    rowResult = await runPut(targetTable, row, conditionalWrite);
                }
                if(operation === 'get') {
                    const key = {};

                    key[PK] = row[PK];
                    key[SK] = row[SK];

                    rowResult = await runGet(targetTable, key, strength);
                }
                

            } catch (err) { 
                console.error('Error: ' + JSON.stringify(err, null, 2));
            }

            httpStatusCode = rowResult?.result?.$metadata?.httpStatusCode || rowResult?.result?.error?.code;
            attempts = rowResult?.result?.$metadata?.attempts || rowResult?.result?.error?.attempts;

            rowSummary = {
                requestNum: rowNum,
                experiment: experiment,
                test: test,
                jobFile: jobFile,
                operation: operation,
                targetTable:targetTable,
                PK: pkValue,
                jobTimestamp: jobTimestamp,
                jobSecond: jobSecond,
                jobTimestampMs: jobTimestampMs,
                jobElapsed: jobElapsed,
                latency: rowResult?.latency,
                velocity: null,
                httpStatusCode: httpStatusCode,
                attempts: attempts,
                ConsumedCapacity: rowResult?.result?.ConsumedCapacity?.CapacityUnits
            };

            // normally, emit request stats after each request.
            // But, we will wait and do it once the next loop begins,
            // to see if we can include a complete second summary for a finished second.
            //
            // jobResults.push(rowSummary);
        }
        console.log('Second : ' + (jobSecond) + ' requests: ' + requestsThisSecond);
                
        if(jobSecond === 1) {
            rowSummary['velocity'] = requestsThisSecond;
        }
        jobResults.push(rowSummary); // final summary
    }

    const jrColumns = Object.keys(jobResults[0]);

    const resultsFileData = jobResults.map(
        (item, index) => {
            return('\n' + jrColumns.map((col, idx) => {
                return(item[col]);
            }) );
        }).join('');

    const dir = pathToExperimentsFolder + experiment;

    // make local folder and file
    await fs.mkdir(dir, { recursive: true });

    try {
        await fs.access(dir + '/data.csv', fs.constants.F_OK);
    } catch (err) {
        if(err?.code === 'ENOENT') {
            const dataFile = await fs.appendFile( dir + '/data.csv', jrColumns.toString(), 'utf-8', { flag: 'a' } );
        }
    }
    await fs.appendFile( dir + '/data.csv', resultsFileData, 'utf-8', { flag: 'a' } );

    // await fs.appendFile( dir + '/summary.json', resultsFileData, 'utf-8', { flag: 'a' } );

    return jobResults;
}

export {runJob};