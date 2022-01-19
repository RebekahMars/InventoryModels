import React from 'react';
import styled from 'styled-components'
import generalData from '../atoms/Images/ModelGeneralData.png'
import variableCorrelationDataPlot from '../atoms/Images/DataCorrelationVariables.png'
import variableCorrelationDataTable from '../atoms/Images/DataCorrelationTable.png'
import arimaModel from '../atoms/Images/ARIMAModel.png'
import sarimaxTrainedModelResults from '../atoms/Images/TrainedModelSARIMAXResults.png'
import trainedModelResults from '../atoms/Images/TrainedModelResults.png'


const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 10px;
  padding-left: 20px;
  padding-bottom: 20px;
  align-items: center;
`;

const Header = styled.h1`
  display: flex;
  justify-content; center;
  align-items: center;
  text-align: center;
`
const InfoHeader = styled.h2`
    display: flex;
    justify-content; center;
    align-items: center;
    text-align: center;
`;
const ModelingInformationPage = () => {

    return (
        <>
            <Header>Machine Learning Model Data & Visuals</Header>
            <DataContainer>
                <InfoHeader>Complete Dataset Visual</InfoHeader>
                    <img src={generalData}/>
            </DataContainer>
            <DataContainer>
                <InfoHeader>Dataset Variable Correlation Plot</InfoHeader>
                    <img src={variableCorrelationDataPlot} width='800px'/>
            </DataContainer>
            <DataContainer>
                <InfoHeader>Dataset Variable Correlation Table</InfoHeader>
                    <img src={variableCorrelationDataTable} width='900px'/>
            </DataContainer>
            <DataContainer>
                <InfoHeader>ARIMA Model</InfoHeader>
                    <img src={arimaModel}/>
            </DataContainer>
            <DataContainer>
                <InfoHeader>Trained ARIMA Model</InfoHeader>
                    <img src={sarimaxTrainedModelResults}/>
            </DataContainer>
            <DataContainer>
                <InfoHeader>ARIMA Model Testing Results</InfoHeader>
                    <img src={trainedModelResults} width='600px'/>
                    <h3>Trained ARIMA model calculated Mean-Squared Error (MSE): 51.29</h3>
            </DataContainer>
        </>
    )
}

export default ModelingInformationPage;