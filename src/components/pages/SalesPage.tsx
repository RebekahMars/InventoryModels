import React from 'react';
import styled from 'styled-components';
import LabSalesTable from '../organisms/SalesTable';

const Header = styled.h1`
  display: flex;
  justify-content; center;
  align-items: center;
  text-align: center;
`

const SalesPage = () => {
  
    return (
      <>
      <Header>Lab Sales</Header>
      <LabSalesTable/>
      </>
    )
  };
  
  export default SalesPage;