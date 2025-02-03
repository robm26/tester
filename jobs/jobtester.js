import {runJob} from "./jobExec.js";

const run = async () => {
    const expName = 'E' + Math.floor(new Date().getTime() / 1000).toString();
    // const warmed = await runWarm({targetTable: 'MREC'});

    let params;
    params = {
        experiment: expName,
        test: 'MREC',
        dbEngine: 'dynamodb',
        targetTable: 'MREC',
        items: 10,
        PK: 'PK',
        jobFile: 'load-smallitems.js'
    };

    const results = await runJob(params);

    // console.log('Test ' + params['test'] + ': processed ' + params['items']);

    // console.log(results);
};

void run().then(()=>{
    process.exit(1);
});