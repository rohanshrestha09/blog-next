import { createSlice } from '@reduxjs/toolkit';

const authBlogSlice = createSlice({
  name: 'authBlog',
  initialState: {
    pageSize: 20,
    sort: '',
    genre: [] as Array<string>,
    isPublished: undefined as boolean | undefined,
  },
  reducers: {
    setPageSize: (state, { payload: { pageSize } }: { payload: { pageSize: number } }) => {
      return (state = { ...state, pageSize });
    },
    setGenre: (state, { payload: { genre } }: { payload: { genre: string[] | [] } }) => {
      return (state = { ...state, genre });
    },
    setSort: (state, { payload: { sort } }: { payload: { sort: string } }) => {
      return (state = { ...state, sort });
    },
    setPublishedStatus: (state, { payload: { key } }: { payload: { key: string } }) => {
      const getStatus = (key: string): boolean | undefined => {
        switch (key) {
          case 'allblogs':
            return undefined;

          case 'published':
            return true;

          case 'unpublished':
            return false;

          default:
            return undefined;
        }
      };

      return (state = { ...state, isPublished: getStatus(key) });
    },
  },
});

export const { setPageSize, setGenre, setPublishedStatus } = authBlogSlice.actions;

export default authBlogSlice.reducer;
