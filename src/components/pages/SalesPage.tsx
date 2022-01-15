import React from 'react';
import styled from 'styled-components';
import LabSalesTable from '../organisms/SalesTable';

const Header = styled.h1`
  display: flex;
  justify-content; center;
  align-items: center;
  text-align: center;
`
const Container = styled.div`
  display: flex;
  justify-content: center;
  margin: 10px;
  padding-left: 20px;
  align-items: center;
`;


const SalesPage = () => {
  
    return (
      <>
      <Header>Lab Sales</Header>
      <Container>
          <LabSalesTable/>
      </Container>
      </>
    )
  };
  
  export default SalesPage;