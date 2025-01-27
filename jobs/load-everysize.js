// job to load everysize table, with 400 items, each one having a size in KB equal to the key attribute size
import { payloadData, randomString } from './util.js';

const rowMaker = (tick, second) => {
    const tickOffset = tick + 20;
    const newRow = {
        size: 'p' + randomString(8),
        // size: tick.toString(),
        rating: tick.toString(),
        payload: payloadData(tick - 0.3)
    };
    return newRow;
}

const jobInformation = () => {
    return {
        jobType: 'insert',
        targetTable: 'everysize',
        PK: 'size',
        description: 'Load table with items ranging from 1 KB to 400 KB',
        items: 400
    };
}

export {rowMaker, jobInformation};
