import { createSlice } from '@reduxjs/toolkit';

const readingModeSlice = createSlice({
  name: 'authBlog',
  initialState: {
    isTurned: false,
  },
  reducers: {
    turnReadingMode: (state, { payload: { isTurned } }: { payload: { isTurned: boolean } }) => {
      return (state = {
        ...state,
        isTurned,
      });
    },
  },
});

export const { turnReadingMode } = readingModeSlice.actions;

export default readingModeSlice.reducer;
