import React from 'react';
import styled from "styled-components";
import { Routes, Route, Link} from 'react-router-dom';
import MainPage from "./components/pages/MainPage";
import PredictionPage from './components/pages/PredictionPage';
import InventoryPage from './components/pages/InventoryPage';
import SalesPage from './components/pages/SalesPage';

const MainAppHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  background-color: lightblue;
  box-sizing: border-box;
  position: relative;
  height: 50px;
  width: 100%;
`;
const MainApp = () => {
  return (
    <>
    <MainAppHeader>
      <Link to="/">Home</Link>
      <Link to="/inventory">Inventory</Link>
      <Link to="/sales">Sales Data</Link>
      <Link to="/reports">Reports</Link>
    </MainAppHeader>
    <Routes>
      <Route path="/" element={<MainPage/>}/>
      <Route path="/inventory" element={<InventoryPage/>}/>
      <Route path='sales' element={<SalesPage/>}/>
      <Route path='/reports' element={<PredictionPage/>}/>
    </Routes>
    </>
  );
}

export default MainApp;
