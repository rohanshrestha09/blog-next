import { createSlice } from '@reduxjs/toolkit';

const authBlogSlice = createSlice({
  name: 'authBlog',
  initialState: {
    key: 'allblogs',
    cachedKey: [] as Array<string>,
    pageSize: 20,
    sort: 'likes',
    sortOrder: 'asc',
    genre: [] as Array<string>,
    isPublished: undefined as boolean | undefined,
  },
  reducers: {
    setPageSize: (state, { payload: { pageSize } }: { payload: { pageSize: number } }) => {
      return (state = { ...state, pageSize });
    },
    setGenre: (
      state,
      { payload: { genre, checked } }: { payload: { genre: string; checked: boolean } }
    ) => {
      return (state = checked
        ? { ...state, genre: [...state.genre, genre] }
        : { ...state, genre: [...state.genre.filter((val) => val !== genre)] });
    },
    setSort: (state, { payload: { sort } }: { payload: { sort: string } }) => {
      return (state = { ...state, sort });
    },
    setSortOrder: (state, { payload: { sortOrder } }: { payload: { sortOrder: string } }) => {
      return (state = { ...state, sortOrder });
    },
    changeKey: (state, { payload: { key } }: { payload: { key: string } }) => {
      const getStatus = (key: string): boolean | undefined => {
        switch (key) {
          case 'published':
            return true;
          case 'unpublished':
            return false;
          default:
            return undefined;
        }
      };

      return (state = {
        key,
        cachedKey: [...state.cachedKey, key],
        pageSize: 20,
        sort: 'likes',
        sortOrder: 'asc',
        genre: [],
        isPublished: getStatus(key),
      });
    },
  },
});

export const { changeKey, setPageSize, setGenre, setSort, setSortOrder } = authBlogSlice.actions;

export default authBlogSlice.reducer;
