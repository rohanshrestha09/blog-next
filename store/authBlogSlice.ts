import { createSlice } from '@reduxjs/toolkit';
import { MENUKEYS, SORT_TYPE, SORT_ORDER } from '../constants/reduxKeys';

const { ALL_BLOGS, PUBLISHED, UNPUBLISHED, BOOKMARKED, LIKED } = MENUKEYS;

const { LIKES } = SORT_TYPE;

const { ASCENDING } = SORT_ORDER;

const authBlogSlice = createSlice({
  name: 'authBlog',
  initialState: {
    key: ALL_BLOGS,
    cachedKey: [] as Array<string>,
    pageSize: 20,
    sort: LIKES,
    sortOrder: ASCENDING,
    genre: [] as Array<string>,
    isPublished: undefined as boolean | undefined,
    search: {
      [ALL_BLOGS]: '',
      [PUBLISHED]: '',
      [UNPUBLISHED]: '',
      [BOOKMARKED]: '',
      [LIKED]: '',
    },
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
    setSort: (state, { payload: { sort } }: { payload: { sort: SORT_TYPE } }) => {
      return (state = { ...state, sort });
    },
    setSortOrder: (state, { payload: { sortOrder } }: { payload: { sortOrder: SORT_ORDER } }) => {
      return (state = { ...state, sortOrder });
    },
    setSearch: (state, { payload: { search } }: { payload: { search: string } }) => {
      return (state = { ...state, search: { ...state.search, [state.key]: search } });
    },
    changeKey: (state, { payload: { key } }: { payload: { key: MENUKEYS } }) => {
      return (state = {
        ...state,
        key,
        cachedKey:
          key === BOOKMARKED || key === LIKED
            ? [...state.cachedKey, key]
            : state.cachedKey.filter((key) => key !== BOOKMARKED && key !== LIKED),
        pageSize: 20,
        sort: LIKES,
        sortOrder: ASCENDING,
        genre: [],
        isPublished: [ALL_BLOGS, PUBLISHED, UNPUBLISHED].includes(key)
          ? key === ALL_BLOGS
            ? undefined
            : key === PUBLISHED
          : state.isPublished,
      });
    },
  },
});

export const { changeKey, setPageSize, setGenre, setSort, setSortOrder, setSearch } =
  authBlogSlice.actions;

export default authBlogSlice.reducer;
