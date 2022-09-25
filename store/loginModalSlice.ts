import { createSlice } from '@reduxjs/toolkit';

const loginModalSlice = createSlice({
  name: 'loginModal',
  initialState: {
    isOpen: false,
  },
  reducers: {
    openLoginModal: (state) => {
      return (state = { ...state, isOpen: true });
    },
    closeLoginModal: (state) => {
      return (state = { ...state, isOpen: false });
    },
  },
});

export const { openLoginModal, closeLoginModal } = loginModalSlice.actions;

export default loginModalSlice.reducer;
