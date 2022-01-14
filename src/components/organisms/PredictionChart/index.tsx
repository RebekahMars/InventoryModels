import React, { useState, useEffect, FC } from 'react';
import styled from 'styled-components';
import { fetchPrediction } from '../../../requests';

import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, Title,CategoryScale, ChartData } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

const GraphWrapper = styled.div`
  display: flex;
  width: 500px;
  height: 500px;
`;

const PredictionGraph: FC<PredictionProps> = ({periods}) => {

  const [chartIndex, setChartIndex] = useState<number[]>([]);
  const [chartValues, setChartValues] = useState<string[]>([]);

  const createChart = () => {
    let x: number[] = [];
    let y: string[] = [];
    const data = fetchPrediction(periods);
    data.then(results => {
      results = results.replace(/[\[\]']+/g,'')
      let result = results.split(',')
      for(let index=0; index < result.length; index++) {
        x.push(index+1);
        y.push(result[index])
      }
    setChartIndex(x);
    setChartValues(y);
    });
  };

  const chartData = {
    labels: chartIndex,
    datasets: [
      {
        label: 'Dataset 1',
        data: chartValues,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Predicted Forecast for Sales',
      },
    },
  };

  useEffect(() => {
    createChart()
      }, []);
      console.log(chartData);

  return (
    <GraphWrapper>
      <Line data={chartData} options={options}/>
    </GraphWrapper>
  )
};

export default PredictionGraph;