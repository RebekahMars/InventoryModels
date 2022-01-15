import React from 'react';
import styled from 'styled-components'
import LabInventoryTable from '../organisms/InventoryTable';

const Container = styled.div`
  display: flex;
  justify-content: center;
  margin: 10px;
  padding-left: 20px;
  align-items: center;
`;

const Header = styled.h1`
  display: flex;
  justify-content; center;
  align-items: center;
  text-align: center;
`

const InventoryPage = () => {
  
    return (
      <>
      <Header>Lab Inventory</Header>
      <Container>
        <LabInventoryTable/>
      </Container>
      </>
    )
  };
  
  export default InventoryPage;