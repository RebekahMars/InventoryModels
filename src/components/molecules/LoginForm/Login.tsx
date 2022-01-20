import React, {useState} from 'react';
import {SubmitHandler, useForm} from 'react-hook-form';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import Button from '../../atoms/Button';

const FormContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-top: 10px;
    width: 100%;
`;

const StyledForm = styled.form`
    background: white;
    border: 1px solid #dedede;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    margin: 0 auto;
    max-width: 500px;
    padding: 30px 50px;
`;

const StyledFormHeader = styled.h3`
    color: blue;
`;
const StyledErrorMessage = styled.p`
    color: red;
`;

const StyledInputs = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 300px;
    padding-bottom: 10px;
`;
const StyledFormLabel = styled.label`
    color: #3d3d3d;
    display: block;
    font-family: sans-serif;
    font-size: 14px;
    font-weight: 500;
    padding-right: 25px;
    text-align: center;
    margin-top: 5px;
`;

const StyledFormInput = styled.input`
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 5px;
    width: 200px;
`;

const LoginForm: React.FC<LoginInputs> = ({username, password}) => {
    const {register, handleSubmit, formState: {errors}} = useForm<LoginInputs>()
    const [login, setLogin] = useState(false);
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();
    const user = 'admin';
    const pass = 'admin';

    const onSubmit: SubmitHandler<LoginInputs> = (loginData) => {
        if(loginData.username != user || loginData.password != pass){
            setLogin(false);
            setMessage("Incorrect login credentials. Please try again.");
        }
        else{
            setLogin(true);
            setMessage("")
            username === loginData.username;
            password === loginData.password;
            navigate('/home',{ replace: true });
        }
    }
    return (
        <FormContainer>
            <StyledForm onSubmit={handleSubmit(onSubmit)} title="Login Form">
                <StyledFormHeader>Login Form</StyledFormHeader>
                <StyledErrorMessage>{message}</StyledErrorMessage>
                <StyledInputs>
                    <StyledFormLabel>Username</StyledFormLabel>
                    <StyledFormInput {...register('username')}/>
                </StyledInputs>
                <StyledInputs>
                    <StyledFormLabel>Password</StyledFormLabel>
                    <StyledFormInput {...register('password')}/>
                </StyledInputs>
                <Button type="submit">Submit</Button>
            </StyledForm>
        </FormContainer>
    )
};

export default LoginForm;