import React from "react";
import {
    useLoaderData, Form
}  from "@remix-run/react";

import * as fs from 'node:fs/promises';
import { ClientOnly } from 'remix-utils';

import {ChartMaker} from "~/components/chartMaker";

import config from '../../config.json';

import {listBucketFolders, getObject} from "../components/database.mjs";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js/auto';

import { Line } from 'react-chartjs-2';

import {csv} from 'csvtojson';

const experimentResultsPublicFolder = 'experiments';
const experimentResultsRoot = 'public/' + experimentResultsPublicFolder;

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export const loader = async ({ params, request }) => {

    const fileData = await fs.readFile( experimentResultsRoot + '/' +  params.experiment + '/data.csv', 'utf-8');
    console.log('\nfileData:\n' + fileData);

    const bucketPath = 'exp/' + params.experiment + '/data.csv';

    const s3Data = await getObject(config.bucket, bucketPath);
    console.log('s3Data:\n' + s3Data);

    const fileDataObj = await csv().fromString(s3Data);

    let allChartParams = [];

    const chartParams1 = {
        fileDataObj: fileDataObj,
        measure: 'latency',
        yAgg: 'actual',
        xAxis: 'rowNum',
        chartType: 'Line'
    };

    const chartParams2 = {
        fileDataObj: fileDataObj,
        measure: 'velocity',
        yAgg: 'max',
        xAxis: 'jobSecond',
        chartType: 'Line'
    };

    const chartParams3 = {
        fileDataObj: fileDataObj,
        measure: 'latency',
        yAgg: 'max',
        xAxis: 'bucket',
        buckets: 40,
        range: 120, 
        chartType: 'Histogram'
    };

    allChartParams.push(chartParams1);
    allChartParams.push(chartParams2);
    allChartParams.push(chartParams3);


    return {
        fileData:fileData,
        allChartParams: allChartParams,
        params: params
    };
};

export async function action({ params, request }) {

    return {};
}

export default function Experiment() {
    const data = useLoaderData();
    const experiment = data.params.experiment;

    const dataPreviewRaw = data.fileData.slice(0, 1000);
    const dataPreview = dataPreviewRaw.slice(0, dataPreviewRaw.lastIndexOf('\n'));

    const downloadExcelLink = (
        <div className={'downloadDiv'}>
            <b>data.csv :</b>
            &nbsp;&nbsp;
            <a href={'/' + experimentResultsPublicFolder + '/' + experiment + '/data.csv'}
               download={experiment + '-data.csv'}>
                {'download CSV'}</a>
            &nbsp;&nbsp;
            <a href={'ms-excel:ofe|u|http://localhost:3000/' + experimentResultsPublicFolder + '/' + experiment + '/data.csv'}
               download={experiment + '-data.csv'}>
                {'open in Excel'}</a>
        </div>
    );

    const experimentForm = (
        <Form id="experimentForm" method="post"  >
            <div className='jobFormTableDiv'>
                {
                    data.allChartParams.map((chart, index) => {

                        return (<div className='chartDiv' key={index}>
                            <ClientOnly fallback={<Fallback />}>
                                {() => {return (<ChartMaker params={data.allChartParams[index]} />)}
                                }
                            </ClientOnly>
                            <hr/>
                        </div>);
                    })
                }

            </div>
            <div><pre>{JSON.stringify(data, null, 2)}</pre></div>
        </Form>
    );

    return(
        <div>
            {downloadExcelLink}
            <div >{experimentForm}</div>

        </div>
    );
}

function Fallback() {
    return <div>Generating Chart</div>;
}

// function getBrushColor(params) {
//     let color = 'pink';

//     if(params?.dbEngine === 'mysql') {
//         color = 'goldenrod';
//     }
//     if(params?.dbEngine === 'dynamodb') {
//         color = 'dodgerblue';
//     }
//     return color;
// }