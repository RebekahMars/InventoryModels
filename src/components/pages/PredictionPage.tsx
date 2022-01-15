import React, { useState } from 'react';
import styled from 'styled-components';
import PredictionForm from '../molecules/PredictionForm';
import PredictionChart from '../organisms/PredictionChart';


const PredictionPage = () => {
  const [prediction, setPrediction] = useState<number>();
  const submitPrediction = (input: number) => {
    setPrediction(Number(input));
  }

const Header = styled.h1`
  display: flex;
  justify-content; center;
  align-items: center;
  text-align: center;
`

  return (
    <>
      <Header>Sales Forecasting Report</Header>
      <PredictionForm submitPrediction={submitPrediction}/>
     {prediction && <PredictionChart periods={prediction}/>}
    </>
  )
};

export default PredictionPage;