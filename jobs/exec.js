import {handler} from './index.js';
import config from '../config.json' with { type: 'json' };

const args = process.argv;
const expArgs = args.slice(2);

const expName = expArgs.length > 0 ? expArgs[0] : 'Reads.js';
const itemCount = expArgs.length > 1 ? expArgs[1] : 200;
const showEachRequest = expArgs.length > 2 ? expArgs[2] : false;
const waitForMinute = expArgs.length > 3 ? expArgs[3] : true;
const bucketName = config['bucketName'];

const request = {
    expName: expName,
    itemCount: itemCount,
    showEachRequest: showEachRequest,
    waitForMinute: waitForMinute, 
    bucketName: bucketName,
};

const result = await handler(request, null);

// console.log('exec result: ');
// console.log(result);

// console.log(JSON.stringify(JSON.parse(result), null, 2));

