import { createSlice } from '@reduxjs/toolkit';
import { getSortFilterKeys, SORT_FILTER_KEYS, SORT_ORDER, SORT_TYPE } from '../constants/reduxKeys';

const { LIKE_COUNT } = SORT_TYPE;

const { DESCENDING } = SORT_ORDER;

const { size, genre, search, sort, order } = getSortFilterKeys;

const sortFilterSlice = createSlice({
  name: 'sortFilter',
  initialState: {
    size: Object.values(size)
      .map((key) => ({ [key]: 20 }))
      .reduce((prev, curr) => ({ ...prev, ...curr })),
    genre: Object.values(genre)
      .map((key) => ({ [key]: <string[]>[] }))
      .reduce((prev, curr) => ({ ...prev, ...curr })),
    search: Object.values(search)
      .map((key) => ({ [key]: '' }))
      .reduce((prev, curr) => ({ ...prev, ...curr })),
    sort: Object.values(sort)
      .map((key) => ({ [key]: LIKE_COUNT }))
      .reduce((prev, curr) => ({ ...prev, ...curr })),
    order: Object.values(order)
      .map((key) => ({ [key]: DESCENDING }))
      .reduce((prev, curr) => ({ ...prev, ...curr })),
  },
  reducers: {
    setSearch: (
      state,
      { payload: { key, search } }: { payload: { key: SORT_FILTER_KEYS; search: string } }
    ) => {
      return (state = { ...state, search: { ...state.search, [key]: search } });
    },
    setSize: (
      state,
      { payload: { key, size } }: { payload: { key: SORT_FILTER_KEYS; size: number } }
    ) => {
      return (state = {
        ...state,
        size: { ...state.size, [key]: state.size[key] + size },
      });
    },
    setSort: (
      state,
      { payload: { key, sort } }: { payload: { key: SORT_FILTER_KEYS; sort: SORT_TYPE } }
    ) => {
      return (state = { ...state, sort: { ...state.sort, [key]: sort } });
    },
    setOrder: (
      state,
      { payload: { key, order } }: { payload: { key: SORT_FILTER_KEYS; order: SORT_ORDER } }
    ) => {
      return (state = { ...state, order: { ...state.order, [key]: order } });
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

export const { setSize, setSearch, setSort, setOrder, setGenre } = sortFilterSlice.actions;

export default sortFilterSlice.reducer;
