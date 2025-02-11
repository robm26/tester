import config from '@/app/config.json';
import regression from 'regression';


function histogram(arr, buckets, range) {
    if(!arr || !buckets) {
        return null;
    }
    
    // console.log('*** histogram for arr: ' + JSON.stringify(arr, null, 2));
    // console.log('*** histogram for buckets: ' + buckets);
    // console.log(JSON.stringify(arr['datasets'], null, 2));

    // let max = range || 100;
    let bucketSize = range / buckets;
    let bucketList = Array.from(Array(buckets), (e,i)=>  { 
        return i * (range / buckets);
    } );
    // console.log('bucketSize: '  + bucketSize);
    // console.log('bucketRange: '  + bucketList);

    const histTracker = {};

    for (const key of bucketList) {
        histTracker[key] = 0;
    }

    for (const item of arr) {
        for (const bucket of bucketList) {

            if(item >= bucket && item < (bucket + bucketSize)) {
                histTracker[bucket] += 1;
                break;
            }
        }
    }
    
    // console.log('bucketList: ' + JSON.stringify(bucketList, null, 2));

    let myHist = {
        buckets: bucketList,
        counts: Object.values(histTracker)
    };
    // console.log('myHist: ' + JSON.stringify(myHist, null, 2));
    return myHist;
}

const calculateLinearRegression = (xy) => {
    
    // const result = regression.linear([[0, 1], [32, 67], [12, 79]]);
    const result = regression.linear(xy);

    const slope = result.equation[0];
    const yIntercept = result.equation[1];

    return {
        slope: slope,
        yIntercept: yIntercept
    }
}

export {histogram, calculateLinearRegression};

