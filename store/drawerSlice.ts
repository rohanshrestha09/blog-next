import { createSlice } from '@reduxjs/toolkit';

const drawerSlice = createSlice({
  name: 'drawer',
  initialState: {
    isOpen: false,
  },
  reducers: {
    openDrawer: (state) => {
      return (state = { ...state, isOpen: true });
    },
    closeDrawer: (state) => {
      return (state = { ...state, isOpen: false });
    },
  },
});

export const { openDrawer, closeDrawer } = drawerSlice.actions;

export default drawerSlice.reducer;
