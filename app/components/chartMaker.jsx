import React from "react";
import annotationPlugin from 'chartjs-plugin-annotation';


import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js/auto';

import { Line, Bar } from 'react-chartjs-2';
import { MaxPartSizeExceededError } from "@remix-run/node/dist";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    annotationPlugin
);


export function ChartMaker(parms) {

    const params = parms.params;
    let xAxisMax = 0;
    let yAxisUnits = params.measure === 'latency' ? ' ms' : null;
    let xAxisLabel;
    let yAxisLabel;

    const annotations = {};
    let latencyStatsRows = [];
    let velocityStatsRows = [];
    let latencyLimits = {
        min: 0,
        max: 0,
        buckets:[]
    }
    let histo = [];
    let hData;

    // split dataset into sections by the (Experiment.test) test value
    let compareValues = Array.from(new Set(params.fileDataObj.map((line) => line['test'])));

    const dataSets = compareValues.map((val, index) => {
        let myDataSet = params.fileDataObj.filter((row) => {
            let subFilter = true;
            if(params['yAgg'] === 'actual') {
                if(params['measure'] === 'latency') {
                    yAxisLabel = 'client latency';
                    xAxisLabel = 'request number';
                }
                return row['test'] === val; 
            }

            if(params['measure'] === 'velocity') {
                yAxisLabel = 'requests per second';
                xAxisLabel = 'second';
            }

            if(params['measure'] === 'histogram') {
                yAxisLabel = 'count';
                xAxisLabel = 'bucket';
            }

            return row['test'] === val && row[params['measure']]; // skip any that don't have the measure (like final velocity)
        });

        xAxisMax = myDataSet[myDataSet.length-1][params.xAxis] > xAxisMax ? myDataSet[myDataSet.length-1][params.xAxis] : xAxisMax;

        let setStats =  summarize(myDataSet.map((row) => parseInt(row[params.measure])));

        let statsRow = {
            name: val,
            targetTable: myDataSet[0].targetTable,
            avg: setStats.avg
        };
        latencyStatsRows.push(statsRow);

        if(myDataSet.length > 0) {
            hData = histogram(myDataSet.map((row) => parseInt(row[params.measure])), params['buckets'], params['range']);
        }
        if(hData && hData.counts) {
           
            histo.push({
                label: val,
                data: hData.counts
            });
        }

        // let annotation = {
        //     type: 'line',
        //     borderColor: getBrushColor(index, val),
        //     borderDash: [6, 6],
        //     borderDashOffset: 0,
        //     borderWidth: 3,

        //     label: {
        //         display: true,
        //         padding: 4,
        //         content:  val + ' avg ' + parseInt(setStats.avg) + ' ms',
        //         position: 'end',
        //         backgroundColor: getBrushColor(index, val),

        //         xAdjust: 150 * index * -1,
        //         yAdjust: 0,
        //         z:1
        //     },
        //     scaleID: 'y',
        //     value: setStats.avg
        // };

        // annotations[annotation.type + '-' + index] = annotation;

        return {
            label: val,
            data: myDataSet.map((row) => row[params.measure]),
            borderColor: getBrushColor(index, val),
            backgroundColor: getBrushColor(index, val)
        };
    });
    const labels = Array.from({length: xAxisMax}, (_, i) => i + 1);


    const options = {
        responsive: true,
        // stepped: 'middle',
        plugins: {
            legend: {position: 'top'},
            title: {display: true, text: params.measure + ' vs ' + params.xAxis},
            annotation: {annotations: annotations}
        },
        scales: {
            y: {
                ticks: {callback: (label) => label + yAxisUnits},
                title: {display: true, text: yAxisLabel}
            },
            x: {title: {display: true, text: xAxisLabel}}
        }
    };

    const resultsData = {
        labels,
        datasets: dataSets
    };

    let latencySummaryTable = (
        <table className='experimentResultSummaryTable'><thead>
        <tr><th>name</th><th>table</th><th>avg latency (ms)</th></tr>
        </thead>
            <tbody>
            {latencyStatsRows.map((row, index) => {
                return (<tr key={index} >

                    <td>{row.name}</td>
                    <td>{row.targetTable}</td>
                    <td>{parseInt(row.avg)}</td>
                </tr>);
            })}
            </tbody></table>
    );

    let newChart = null;
    if(params['chartType'] === 'Histogram') {
        
        const options = {
            responsive: true,
            plugins: {
                legend: {position: 'top'},
                title: {display: true, text: 'Histogram'}
            },
            scales: {
                y: {},
                x: {}
            }
        };

        const data = {
            labels: hData.buckets,
            datasets: histo
        };
        
        newChart = (
            <Bar
                options={options}
                data={data} />
        );
 
    } else {    
        newChart = (
            <Line
            options={options}
            data={resultsData} />
        );  
        
    }

    return (
        (<div>
            {newChart}
            <br/>
            {params['measure'] === 'latency' & params['chartType'] == 'Line' ? latencySummaryTable : null}
        </div>)
    );

}

function getBrushColor(index, val) {

    const colorList = ['MediumBlue','dodgerblue', 'yellow', 'green'];
    return colorList[index];

}

function summarize(arr) {
    const sum = arr.reduce((total, item) => total + item);
    const avg = sum / arr.length;

    const stats = {
        sum: sum,
        avg: avg
    }
    return stats;

}

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
    console.log('bucketSize: '  + bucketSize);
    console.log('bucketRange: '  + bucketList);

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
