import React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import Button from "../../atoms/Button";


const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const StyledButton = styled(Button)`
    justify-content: center;
`;

export const ButtonMenu = () => {
    return (
        <ButtonWrapper>
            <StyledButton type="button">HI</StyledButton>
        </ButtonWrapper>
    )
}

