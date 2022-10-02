/* import { createSlice } from '@reduxjs/toolkit';
import { MENUKEYS, SORT_TYPE, SORT_ORDER } from '../../constants/reduxKeys';

const { ALL_BLOGS, PUBLISHED, UNPUBLISHED, BOOKMARKED, LIKED } = MENUKEYS;

const { LIKES } = SORT_TYPE;

const { ASCENDING } = SORT_ORDER;

const getIntialState = (initialState: any) => ({
  [ALL_BLOGS]: initialState,
  [PUBLISHED]: initialState,
  [UNPUBLISHED]: initialState,
  [BOOKMARKED]: initialState,
  [LIKED]: initialState,
});

const authBlogSlice = createSlice({
  name: 'authBlog',
  initialState: {
    key: ALL_BLOGS,
    cachedKey: [] as Array<string>,
    pageSize: getIntialState(20),
    sort: getIntialState(LIKES),
    sortOrder: getIntialState(ASCENDING),
    genre: getIntialState([]),
    isPublished: undefined as boolean | undefined,
    search: getIntialState(''),
  },
  reducers: {
    setPageSize: (state, { payload: { pageSize } }: { payload: { pageSize: number } }) => {
      return (state = { ...state, pageSize: { ...state.pageSize, [state.key]: pageSize } });
    },
    setGenre: (
      state,
      { payload: { genre, checked } }: { payload: { genre: string; checked: boolean } }
    ) => {
      return (state = checked
        ? { ...state, genre: { ...state.genre, [state.key]: [...state.genre[state.key], genre] } }
        : {
            ...state,
            genre: {
              ...state.genre,
              [state.key]: state.genre[state.key].filter((val: string) => val !== genre),
            },
          });
    },
    setSort: (state, { payload: { sort } }: { payload: { sort: SORT_TYPE } }) => {
      return (state = { ...state, sort: { ...state.sort, [state.key]: sort } });
    },
    setSortOrder: (state, { payload: { sortOrder } }: { payload: { sortOrder: SORT_ORDER } }) => {
      return (state = { ...state, sortOrder: { ...state.sortOrder, [state.key]: sortOrder } });
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
*/

export {};
