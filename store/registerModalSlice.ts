import { createSlice } from '@reduxjs/toolkit';

const registerModalSlice = createSlice({
  name: 'registerModal',
  initialState: {
    isOpen: false,
  },
  reducers: {
    openRegisterModal: (state) => {
      return (state = { ...state, isOpen: true });
    },
    closeRegisterModal: (state) => {
      return (state = { ...state, isOpen: false });
    },
  },
});

export const { openRegisterModal, closeRegisterModal } = registerModalSlice.actions;

export default registerModalSlice.reducer;
