import styled from 'styled-components';
import { SubmitHandler, useForm } from 'react-hook-form';
import React from 'react';
import Button from '../../atoms/Button';
import { addSingleItem } from '../../../requests';
import { useState } from 'react';

const FormWrapper = styled.div`
display: flex;
flex-direction: column;
`;
const InputWrapper = styled.div`
display: flex;
flex-direction: row;
align-content: center;
text-align: center;
padding: 10px;
`;
const StyledLabel = styled.label`
display: flex;
justify-content: flex-start;
margin-right: auto;
padding: 10px 10px 0px 10px;
text-align: center;
`;
const StyledInput = styled.input`
display: flex;
justify-content: space-between;
margin-left: auto;
padding: 10px 10px 5px 10px;
width: 200px;
`;
const StyledButtonContainer = styled.div`
display:flex;
justify-content: space-evenly;
align-items: center;
padding: 10px;
`;
const StyledSubmitButton = styled(Button)`
align-items: center;    
text-align: center;
background-color: white;
border: 1px solid black;
width: 100px;
}
`;

const StyledCancelButton = styled(Button)`
align-items: center;
text-align: center;
background-color: white;
border: 1px solid black;
width: 100px;
}
`;
interface FormInputs {
    name: string;
    lot_number: string,
    quantity: number;
    order_date: Date;
    expiration_date: Date;
    min_amount: number;
    max_amount: number;
    description: string;
};

interface FormDefaultValues {
    id?: string;
    name: string;
    lot_number: string,
    quantity: number;
    order_date: Date;
    expiration_date: Date;
    min_amount: number;
    max_amount: number;
    description: string;
};

interface FormProps {
    closeModal?: () => void;
    defaultValues?: FormDefaultValues;
    submitText?: string;
    titleText?: string;
}

const ItemForm: React.FC<FormProps> = ({
    closeModal,
    defaultValues,
    submitText,
    titleText
})=> {
    const {register, handleSubmit, formState: {errors}} = useForm<FormInputs>({defaultValues} || {});
    const onSubmit: SubmitHandler<FormInputs> = (data) => {
        console.log("form data", data);
        addSingleItem({...data});
    };
    return (
        <form action="/add" method="POST" onSubmit={handleSubmit(onSubmit)}>
            <FormWrapper>
                <InputWrapper>
                    <StyledLabel>Item Name </StyledLabel>
                        <StyledInput 
                            {...register('name', {required: 'Item Name Required', maxLength: {value: 100, message: 'The max length for an item name is 100 characters'}})}
                            name='name'
                            id='name'
                            type='text'
                            placeholder="Item Name"
                            /* {...errors.name && 'Item Name is Required'} */
                         />
                </InputWrapper>
                <InputWrapper>
                    <StyledLabel>Lot Number </StyledLabel>
                        <StyledInput
                            {...register('lot_number')}
                            name='lot_number'
                            id='lot'
                            type='text'
                            placeholder="Lot Number"
/*                             {...errors.quantity && errors.quantity.type === 'required' && (
                                <div>Please enter an item quantity</div>
                            )} */
                        />
                </InputWrapper>
                <InputWrapper>
                    <StyledLabel>Quantity </StyledLabel>
                        <StyledInput
                            {...register('quantity')}
                            name='quantity'
                            id='quantity'
                            type='number'
                            placeholder="Item Quantity"
/*                             {...errors.quantity && errors.quantity.type === 'required' && (
                                <div>Please enter an item quantity</div>
                            )} */
                        />
                </InputWrapper>
                <InputWrapper>
                    <StyledLabel>Order Date </StyledLabel>
                        <StyledInput
                            {...register('order_date')}
                            name='order_date'
                            id='order'
                            type='date'
                            placeholder="mm/dd/yyyy"
/*                             {...errors.orderDate && errors.orderDate.type === 'required' && (
                                <div>Please enter an order date</div>
                            )} */
                        />
                </InputWrapper>
                <InputWrapper> 
                    <StyledLabel>Expiration Date </StyledLabel>
                        <StyledInput
                            {...register ('expiration_date')}
                            name='expiration_date'
                            id='expiration'
                            type='date'
                            placeholder="mm/dd/yyyy"
/*                             {...errors.expiration && errors.expiration.type === 'required' && (
                                <div>Please enter an expiration date</div>
                            )} */
                        />
                </InputWrapper> 
                <InputWrapper>             
                    <StyledLabel>Minimum On-Hand </StyledLabel>
                        <StyledInput
                            {...register('min_amount')}
                            name='min_amount'
                            id='min'
                            type='number'
                            placeholder="Item Minimum"
/*                             {...errors.minAmount && errors.minAmount.type === 'required' && (
                                <div>Please enter a minimum amount</div>
                            )} */
                        />
                </InputWrapper>
                <InputWrapper> 
                    <StyledLabel>Maximum On-Hand </StyledLabel>
                        <StyledInput 
                           {...register('max_amount')}
                            name='max_amount'
                            id='max'
                            type='number'
                            placeholder="Item Maximum"
/*                             {...errors.maxAmount && errors.maxAmount.type === 'required' && (
                                <div>Please enter a maximum amount</div>
                            )} */
                        />
                </InputWrapper> 
                <InputWrapper> 
                    <StyledLabel>Description of Item </StyledLabel>
                        <StyledInput
                            {...register('description')}
                            name='description'
                            id='decription'
                            type='text'
                            placeholder="Item Description"
/*                             {...errors.description && errors.description.type === 'required' && (
                                <div>Please enter a description</div>
                            )} */
                        />
                </InputWrapper>
                <StyledButtonContainer>
                        <StyledSubmitButton type="submit">Submit</StyledSubmitButton>
                        <StyledCancelButton type="button" onClick={closeModal}>Cancel</StyledCancelButton>
                </StyledButtonContainer>
            </FormWrapper>
        </form>
    )
};

export default ItemForm;
