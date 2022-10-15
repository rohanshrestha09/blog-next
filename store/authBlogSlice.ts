import { createSlice } from '@reduxjs/toolkit';
import { AUTH_PROFILE_KEYS } from '../constants/reduxKeys';

const { ALL_BLOGS, PUBLISHED } = AUTH_PROFILE_KEYS;

const authBlogSlice = createSlice({
  name: 'authBlog',
  initialState: {
    key: ALL_BLOGS,
    isPublished: undefined as boolean | undefined,
  },
  reducers: {
    changeKey: (state, { payload: { key } }: { payload: { key: AUTH_PROFILE_KEYS } }) => {
      return (state = {
        ...state,
        key,
        isPublished: key === ALL_BLOGS ? undefined : key === PUBLISHED,
      });
    },
  },
});

export const { changeKey } = authBlogSlice.actions;

export default authBlogSlice.reducer;
