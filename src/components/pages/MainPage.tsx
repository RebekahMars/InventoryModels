import React, { useState, useEffect, FC } from 'react';
import styled from 'styled-components';
import { useAddModal, useDeleteModal, useUpdateModal } from '../../hooks';
import { fetchInventoryData, fetchPrediction } from '../../requests';

import Button from '../atoms/Button';
import AddModal from '../organisms/AddItemModal';
import LabInventoryTable from "../organisms/InventoryTable";

import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, Title,CategoryScale, ChartData } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Chart } from 'react-chartjs-2';

ChartJS.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);


const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const GraphWrapper = styled.div`
  display: flex;
  width: 80%;
  height: 500px;
`;

const MainPage: FC<MainPageProps> = ({message}) => {
  const {addModalOpen, addModalToggle} = useAddModal();
  const {deleteModalOpen, deleteModalToggle} = useDeleteModal();
  const {updateModalOpen, updateModalToggle} = useUpdateModal();

  const [chartIndex, setChartIndex] = useState<number[]>([]);
  const [chartValues, setChartValues] = useState<string[]>([]);

  const createChart = () => {
    let x: number[] = [];
    let y: string[] = [];
    const data = fetchPrediction();
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

export default MainPage;