import React, {useState} from 'react';
import styled from 'styled-components';
import { SubmitHandler, useForm } from 'react-hook-form';

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
    flex-direction: row;
    justify-content: space-around;
    margin: 0 auto;
    max-width: 500px;
    padding: 30px 50px;
`;

const StyledFormLabel = styled.label`
    color: #3d3d3d;
    display: block;
    font-family: sans-serif;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 5px;
`;

const StyledFormInput = styled.input`
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 5px;
    width: 100%;
`;


const PredictionForm: React.FC<PredictionFormProps> = ({titleText, headerText, submitText, submitPrediction}) => {
    const {register, handleSubmit, formState: {errors}} = useForm<PredictionInputs>({});
    const [formData, setFormData] = useState<number>();

    const onSubmit: SubmitHandler<PredictionInputs> = (data) => {
        submitPrediction(data.predictionPeriods);
    };

    return (
        <FormContainer>
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
            <StyledFormLabel>Days to Predict</StyledFormLabel>
            <StyledFormInput {...register('predictionPeriods')} name='predictionPeriods' value={formData} type="number" />
            <button type="submit">Generate Prediction</button>
        </StyledForm>
        </FormContainer>
    )
};
export default PredictionForm;

