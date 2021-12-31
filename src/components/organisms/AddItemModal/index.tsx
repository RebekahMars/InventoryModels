import React from "react";
import styled from 'styled-components';
import Modal from "../../atoms/Modal";

import ItemForm from "../../molecules/ItemForm";

const StyledModal = styled(Modal)`
    display: flex;
    flex-direction: column;
    align-content: center;
    width: 100%;
`;

const AddModal = () => {
    return (
        <StyledModal
            className="add-modal"
            header="Add Item to Inventory"
            modalContent={<ItemForm/>}
        />
    )
};

export default AddModal;