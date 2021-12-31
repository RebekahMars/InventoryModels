import styled from 'styled-components';

const Button = styled.button<ButtonProps>`
    align-items: center;
    background: white;
    border: 1px solid blue;
    border-radius: 5rem;
    cursor: pointer;
    color: black;
    height: 25px;
    font-size: 15px;
`;

export default Button;