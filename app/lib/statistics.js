
import regression from 'regression';

import css from '@/app/page.module.css';
import { getBrushColor } from "@/app/lib/brushcolor.js";


function histogram(arr, buckets, range) {
    if(!arr || !buckets) {
        return null;
    }
    
    let bucketSize = range / buckets;
    let bucketList = Array.from(Array(buckets), (e,i)=>  { 
        return i * (range / buckets);
    } );

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

    let hCounts = Object.values(histTracker);

    let lastFilledBucket = buckets;

    for (let i = 1; i < hCounts.length; i++) {

        if(hCounts[buckets - i] === 0 ) {
            lastFilledBucket = buckets - i;
        } else {
            break;
        }
    }

    let myHist = {
        buckets: bucketList.slice(0, lastFilledBucket + 1),
        counts: hCounts.slice(0, lastFilledBucket + 1)
    };

    return myHist;
}

const calculateLinearRegression = (xy) => {
    
    const result = regression.linear(xy, {
        order: 2, 
        precision: 3
    });

    const slope = result.equation[0];
    const yIntercept = result.equation[1];

    return {
        slope: slope,
        yIntercept: yIntercept
    }
}

function calculateTailLatency(data, percentile) {
    if (!data || data.length === 0) {
      return null; // Return null for empty or invalid input
    }
    if(data.length < percentile) {
        return null;
    }

    const pNumber = percentile/100;

    const sortedData = [...data].sort((a, b) => a - b); 
    const index = Math.ceil(sortedData.length * pNumber) - 1; 
    
    return sortedData[index];

}

const makeStats = (stats, options) => {
    if(!stats || stats.length === 0) {
        return (<div></div>);
    }
    const cols = Object.keys(stats[0]);

    return(<table className={css.statsTable}><thead>
        <tr>
            <th>Test</th>
            <th>Action</th>
            <th>Items</th>
            <th>Average latency in ms</th>
            <th>P99 latency</th>
     
        </tr>
        </thead><tbody>
            {stats.map((statline, ix) => {
                let color = getBrushColor(ix);
                return (<tr key={ix}>
                    {cols.map((col, ix2) => {
                        return (<td key={ix2} 
                            style={ix2 === cols.length - 2 ? {color:color, fontWeight:'bold', fontSize:'larger'} : {}}
                        >
                            {statline[col]}
                            </td>);
                    })}
                    </tr>);

            })}

        </tbody>
    </table>);

}

const makeLinearStats = (stats, options) => {

    const cols = Object.keys(stats[0]);
    return(<table className={css.statsTable}><thead>
        <tr>
            <th>Test</th>
            <th>Action</th>
            <th>Items</th>
            <th>Slope</th>
            <th>yIntercept</th>
            <th>Expected Latency in ms</th>
     
        </tr>
        </thead><tbody>
            {stats.map((statline, ix) => {
                let color = getBrushColor(ix);

                return (<tr key={ix}>
                    {cols.map((col, ix2) => {
                        return (<td key={ix2} 
                            style={ix2 >= cols.length - 2 ? {color:color, fontWeight:'bold', fontSize:'larger'} : {}}
                        >
                            {statline[col]} 
                            </td>);
                    })}
                    <td key={'123'} style={{fontWeight:'bold'}} > ({statline['slope']} * itemSize) + {statline['yIntercept']}</td>

                    </tr>);

            })}

        </tbody>
    </table>);

}


export {histogram, calculateLinearRegression, calculateTailLatency, makeStats, makeLinearStats};

