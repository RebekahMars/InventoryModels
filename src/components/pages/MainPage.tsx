import React, { FC, useState } from 'react';
import styled from 'styled-components';
import PredictionGraph from '../organisms/PredictionChart';


const MainPage: FC<MainPageProps> = () => {
  const [prediction, setPrediction] = useState(0);
  
  return (
    <div>Hello</div>
  //  prediction ? (<PredictionGraph periods={prediction}/>) : (
  //   <div> 
  //     Generate Prediction 
  //     <input type="text" placeholder="Enter number of days to generate future data"></input>
  //     <button onClick={()=> {setPrediction(365)}}>Predict!</button>
  //   </div>)
  )
};

export default MainPage;