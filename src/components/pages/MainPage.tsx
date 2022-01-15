import React from 'react';
import styled from 'styled-components';

const StyledMessageBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: left;
`;

const MainPage = () => {
  return (
    <>
    <StyledMessageBox>
      <h1>Welcome to the Diagnostic Lab Inventory & Prediction Tool!</h1>
      <h2>Here is a quick guide on navigating this site: </h2>
      <h3>Click on Inventory to view the lab's current inventory</h3>
      <h3>Click on Sales to view the lab's current sales history</h3>
      <h3>Click on Reports to generate forecasted sales based on the lab's current sales</h3>
      <h3>Click on Home to return to this page</h3>
    </StyledMessageBox>
    </>
  )
};

export default MainPage;