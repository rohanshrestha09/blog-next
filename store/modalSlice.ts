import { createSlice } from '@reduxjs/toolkit';
import { MODAL_KEYS } from '../constants/reduxKeys';

const { LOGIN, REGISTER, DELETE, EDIT_PROFILE, FOLLOWERS_MODAL } = MODAL_KEYS;

const modalSlice = createSlice({
  name: 'modal',
  initialState: {
    isOpen: {
      [LOGIN]: false,
      [REGISTER]: false,
      [DELETE]: false,
      [EDIT_PROFILE]: false,
      [FOLLOWERS_MODAL]: false,
    },
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
