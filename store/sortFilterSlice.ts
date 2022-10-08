import { createSlice } from '@reduxjs/toolkit';
import { SORT_FILTER_KEYS, SORT_ORDER, SORT_TYPE } from '../constants/reduxKeys';

const { HOME_SORT, AUTH_PROFILE_SORT } = SORT_FILTER_KEYS;

const { LIKES } = SORT_TYPE;

const { ASCENDING } = SORT_ORDER;

const sortFilterSlice = createSlice({
  name: 'sortFilter',
  initialState: {
    pageSize: Object.values(SORT_FILTER_KEYS)
      .map((key) => ({ [key]: 20 }))
      .reduce((prev, curr) => ({ ...prev, ...curr })),
    genre: Object.values(SORT_FILTER_KEYS)
      .map((key) => ({ [key]: <string[]>[] }))
      .reduce((prev, curr) => ({ ...prev, ...curr })),
    search: Object.values(SORT_FILTER_KEYS)
      .map((key) => ({ [key]: '' }))
      .reduce((prev, curr) => ({ ...prev, ...curr })),
    sort: {
      [HOME_SORT]: LIKES,
      [AUTH_PROFILE_SORT]: LIKES,
    },
    sortOrder: {
      [AUTH_PROFILE_SORT]: ASCENDING,
    },
  },
  reducers: {
    setSearch: (
      state,
      { payload: { key, search } }: { payload: { key: SORT_FILTER_KEYS; search: string } }
    ) => {
      return (state = { ...state, search: { ...state.search, [key]: search } });
    },
    setPageSize: (
      state,
      { payload: { key, pageSize } }: { payload: { key: SORT_FILTER_KEYS; pageSize: number } }
    ) => {
      return (state = { ...state, pageSize: { ...state.pageSize, [key]: pageSize } });
    },
    setSort: (
      state,
      {
        payload: { key, sort },
      }: {
        payload: {
          key: SORT_FILTER_KEYS.HOME_SORT | SORT_FILTER_KEYS.AUTH_PROFILE_SORT;
          sort: SORT_TYPE;
        };
      }
    ) => {
      return (state = { ...state, sort: { ...state.sort, [key]: sort } });
    },
    setSortOrder: (
      state,
      {
        payload: { key, sortOrder },
      }: { payload: { key: SORT_FILTER_KEYS.AUTH_PROFILE_SORT; sortOrder: SORT_ORDER } }
    ) => {
      return (state = { ...state, sortOrder: { ...state.sortOrder, [key]: sortOrder } });
    },
    setGenre: (
      state,
      { payload: { key, genre } }: { payload: { key: SORT_FILTER_KEYS; genre: string } }
    ) => {
      return (state = state.genre[key].includes(genre)
        ? {
            ...state,
            genre: {
              ...state.genre,
              [key]: state.genre[key].filter((val: string) => val !== genre),
            },
          }
        : { ...state, genre: { ...state.genre, [key]: [...state.genre[key], genre] } });
    },
  },
});

export const { setPageSize, setSearch, setSort, setSortOrder, setGenre } = sortFilterSlice.actions;

export default sortFilterSlice.reducer;
