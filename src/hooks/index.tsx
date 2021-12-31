import {useState} from 'react';

export const useAddModal = () => {
    const [addModalOpen, setAddModalOpen] = useState(false);

    const addModalToggle = () => setAddModalOpen(!addModalOpen);

    return {
        addModalOpen, addModalToggle
    };
};
export const useDeleteModal = () => {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const deleteModalToggle = () => setDeleteModalOpen(!deleteModalOpen);

    return {
        deleteModalOpen, deleteModalToggle
    };
};
export const useUpdateModal = () => {
    const [updateModalOpen, setUpdateModalOpen] = useState(false);

    const updateModalToggle = () => setUpdateModalOpen(!updateModalOpen);

    return {
        updateModalOpen, updateModalToggle
    };
};