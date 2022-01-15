import React, { useState, useEffect, FC } from 'react';
import styled from 'styled-components';
import { fetchPrediction } from '../../../requests';

import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, Title,CategoryScale, ChartData } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const GraphWrapper = styled.div`
  width: 50%;
  height: 50%;
  align-items: center;
`;

const PredictionWrapper = styled.div`
  width: 50%;
  height: 50%;
  align-items: center;
  text-align: center;
  padding-top: 150px;
  font-size: 20px;
  font-weight: 500;
`;

const PredictionChart: FC<PredictionProps> = ({periods}) => {
  const [chartIndex, setChartIndex] = useState<number[]>([]);
  const [chartValues, setChartValues] = useState<string[]>([]);
  const [growthRate, setGrowthRate] = useState<string>();

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

  const calculateGrowthRate = () => {
    let chartDataPoints = chartValues.map(Number);
    let firstDataPoint = chartDataPoints[0];
    let lastDataPoint = chartDataPoints[(chartDataPoints.length-1)];
    let growthAsPercentage = (((lastDataPoint - firstDataPoint) / firstDataPoint) * 100).toFixed(2);
    setGrowthRate(growthAsPercentage);
  }

  const chartData = {
    labels: chartIndex,
    datasets: [
      {
        label: 'Prediction Dataset',
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
      scales: {
        x: {
          display: true,
          scaleLabel: {
            labelString: 'Days'
          }
        },
        y: {
          display: true,
          scaleLabel: {
            labelString: 'Forecasted Sales'
          }
        }
      }
    },
  };

  useEffect(() => {
    createChart();
    calculateGrowthRate();
  }, [chartValues]);

  return (
    <>
    <Wrapper>
      <GraphWrapper>
        <Line data={chartData} options={options}/>
      </GraphWrapper>
      <PredictionWrapper>Over the course of {chartValues.length} days, sales are pedicted to change by {growthRate}% </PredictionWrapper>
    </Wrapper>
    </>
  )
};

export default PredictionChart;