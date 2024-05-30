import { createSlice } from '@reduxjs/toolkit';

const readingModeSlice = createSlice({
  name: 'readingMode',
  initialState: {
    isReadingMode: false,
  },
  reducers: {
    turnOnReadingMode: (state) => {
      return (state = { ...state, isReadingMode: true });
    },
    turnOffReadingMode: (state) => {
      return (state = { ...state, isReadingMode: false });
    },
  },
});

export const { turnOnReadingMode, turnOffReadingMode } = readingModeSlice.actions;

export default readingModeSlice.reducer;
