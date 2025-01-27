import {runJob} from "./jobExec.js";

const run = async () => {

    const params = {
        experiment: 'Exp3',
        test: 'EventsTest',
        dbEngine: 'dynamodb',
        targetTable: 'everysize',
        items: 2,
        PK: 'size',
        jobFile: 'load-everysize.js'
    };

    const results = await runJob(params);
    console.log('results:\n');
    console.log(results);
};

void run().then(()=>{
    process.exit(1);
});