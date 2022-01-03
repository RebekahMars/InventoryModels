import React, { useState, FC } from 'react';
import styled from 'styled-components';
import { useAddModal, useDeleteModal, useUpdateModal } from '../../hooks';

import Button from '../atoms/Button';
import AddModal from '../organisms/AddItemModal';
import LabInventoryTable from "../organisms/InventoryTable";


const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const dummy_data = [
    {
        id: 1,
        name: "20uL Pipette",
        quantity: 5,
        order_date: "2021-05-06",
        expiration: "N/A",
        min_amount: 2,
        max_amount: 10,
        description: "20uL Pipette for plating"
    }
  ];

const MainPage: FC<MainPageProps> = ({message}) => {
      const {addModalOpen, addModalToggle} = useAddModal();
      const {deleteModalOpen, deleteModalToggle} = useDeleteModal();
      const {updateModalOpen, updateModalToggle} = useUpdateModal();


      

      return (
        <div>
        <ButtonWrapper>
            <Button type="button" onClick={addModalToggle}>Add Item</Button>
            <Button type="button" onClick={()=>deleteModalToggle}>Update Item</Button>
            <Button type="button" onClick={()=> updateModalToggle}>Delete Item</Button>
        </ButtonWrapper>
          <LabInventoryTable/> 
        </div>
      )
  };

  export default MainPage;