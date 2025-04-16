'use client'
const hideLatency = true;

import { Line, Bar, Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js/auto';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const MyChart = (req)  => {
  let data = req['data'];
  let summary = data['summary'];
  let chartType = req['chartType'];

  let xLabel;
  let yLabel;
  let titlePre;

  let showX = true;
  let showY = true;
  let showXgrid = true;
  let showYgrid = true;


  if(chartType === 'LA') {
    xLabel = summary['xAxisLabel'] + ' (' + summary['xAxisUnits'] + ')';
    yLabel = summary['yAxisLabel'] + ' (' + summary['yAxisUnits'] + ')';
    titlePre = 'Requests';

    if(hideLatency) {
      showY = false;
      showYgrid = false;
    }

  }

  if(chartType === 'HI') {
    xLabel = 'latency bucket';
    yLabel = 'count';
    titlePre = 'Histogram';

    if(hideLatency) {
      showX = false;
      showXgrid = false;

    }

  }

  if(chartType === 'LS') {
    xLabel = 'item size';
    yLabel = 'latency';
    titlePre = 'XY scatter';

    if(hideLatency) {

      showY = false;
      showYgrid = false;
    }
  }

  let options = {
    responsive: true,
    scales: {
      y: {
          ticks: {
            display: showY 
          },
          grid: {
            display: showYgrid,
          },
          beginAtZero: true,
          title: {
            display: true,
            align: 'center',
            text: yLabel,
            color: 'dimgray',
            font: {
              family: 'Arial',
              size: 12,
              weight: 'bold',
            }
          }
        },
        x: {
          ticks: {
            display: showX 
          },
          grid: {
            display: showXgrid,
          },
          title: {
            display: true,
            align: 'center',
            text: xLabel,
            color: 'dimgray',
            font: {
              family: 'Arial',
              size: 12,
              weight: 'bold',
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
        },

        title: {
          display: true,
          text: [titlePre + ':   ',  data['summary']['desc']],
          color: 'black',
          font: {
            family: 'Arial',
            size: 16,
            weight: 'bold',
          }
        },
      },
  };

  let theChart;

  if(chartType === 'LA') {

    theChart = (
      <Line data={data} options={options} />
    );
  }

  if(chartType === 'HI') {
    
    theChart = (
      <Bar data={data} options={options} />
    );
  }

  if(chartType === 'LS') {

    theChart = (
      <Scatter data={data} options={options} />
    );
  }

  return (
    <div> 
      {theChart}
      <hr/>
    </div>
  );
};


export default MyChart;