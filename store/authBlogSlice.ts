import { createSlice } from '@reduxjs/toolkit';
import { PROFILE_KEYS, SORT_TYPE, SORT_ORDER } from '../constants/reduxKeys';

const { ALL_BLOGS, PUBLISHED } = PROFILE_KEYS;

const { LIKES } = SORT_TYPE;

const { ASCENDING } = SORT_ORDER;

const authBlogSlice = createSlice({
  name: 'authBlog',
  initialState: {
    key: ALL_BLOGS,
    pageSize: 20,
    sort: LIKES,
    sortOrder: ASCENDING,
    genre: [] as Array<string>,
    isPublished: undefined as boolean | undefined,
    search: '',
  },
  reducers: {
    changeKey: (state, { payload: { key } }: { payload: { key: PROFILE_KEYS } }) => {
      return (state = {
        ...state,
        key,
        isPublished: key === ALL_BLOGS ? undefined : key === PUBLISHED,
      });
    },
    setPageSize: (state, { payload: { pageSize } }: { payload: { pageSize: number } }) => {
      return (state = { ...state, pageSize });
    },
    setGenre: (
      state,
      { payload: { genre, checked } }: { payload: { genre: string; checked: boolean } }
    ) => {
      return (state = checked
        ? { ...state, genre: [...state.genre, genre] }
        : {
            ...state,
            genre: state.genre.filter((val: string) => val !== genre),
          });
    },
    setSort: (state, { payload: { sort } }: { payload: { sort: SORT_TYPE } }) => {
      return (state = { ...state, sort });
    },
    setSortOrder: (state, { payload: { sortOrder } }: { payload: { sortOrder: SORT_ORDER } }) => {
      return (state = { ...state, sortOrder });
    },
    setSearch: (state, { payload: { search } }: { payload: { search: string } }) => {
      return (state = { ...state, search });
    },
  },
});

export const { changeKey, setPageSize, setGenre, setSort, setSortOrder, setSearch } =
  authBlogSlice.actions;

export default authBlogSlice.reducer;
