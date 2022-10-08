import { createSlice } from '@reduxjs/toolkit';
import { MODAL_KEYS } from '../constants/reduxKeys';

const modalSlice = createSlice({
  name: 'modal',
  initialState: {
    isOpen: Object.values(MODAL_KEYS)
      .map((key) => ({ [key]: false }))
      .reduce((prev, curr) => ({ ...prev, ...curr })),
  },
  reducers: {
    openModal: (state, { payload: { key } }: { payload: { key: MODAL_KEYS } }) => {
      return (state = { ...state, isOpen: { ...state.isOpen, [key]: true } });
    },
    closeModal: (state, { payload: { key } }: { payload: { key: MODAL_KEYS } }) => {
      return (state = { ...state, isOpen: { ...state.isOpen, [key]: false } });
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;

export default modalSlice.reducer;
