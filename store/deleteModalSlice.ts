import { createSlice } from '@reduxjs/toolkit';

const deleteModalSlice = createSlice({
  name: 'deleteModal',
  initialState: {
    isOpen: false,
  },
  reducers: {
    openDeleteModal: (state) => {
      return (state = { ...state, isOpen: true });
    },
    closeDeleteModal: (state) => {
      return (state = { ...state, isOpen: false });
    },
  },
});

export const { openDeleteModal, closeDeleteModal } = deleteModalSlice.actions;

export default deleteModalSlice.reducer;
