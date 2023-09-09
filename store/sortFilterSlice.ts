import { createSlice } from '@reduxjs/toolkit';
import { getSortFilterKeys, SORT_FILTER_KEYS, SORT_ORDER, SORT_TYPE } from '../constants/reduxKeys';

const { LIKE_COUNT } = SORT_TYPE;

const { DESCENDING } = SORT_ORDER;

const { size, genre, name, title, sort, order } = getSortFilterKeys;

const sortFilterSlice = createSlice({
  name: 'sortFilter',
  initialState: {
    size: Object.values(size)
      .map((key) => ({ [key]: 20 }))
      .reduce((prev, curr) => ({ ...prev, ...curr })),
    genre: Object.values(genre)
      .map((key) => ({ [key]: <string[]>[] }))
      .reduce((prev, curr) => ({ ...prev, ...curr })),
    name: Object.values(name)
      .map((key) => ({ [key]: '' }))
      .reduce((prev, curr) => ({ ...prev, ...curr })),
    title: Object.values(title)
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
    setNameSearch: (
      state,
      { payload: { key, name } }: { payload: { key: SORT_FILTER_KEYS; name: string } },
    ) => {
      return (state = {
        ...state,
        name: { ...state.name, [key]: name },
      });
    },
    setTitleSearch: (
      state,
      { payload: { key, title } }: { payload: { key: SORT_FILTER_KEYS; title: string } },
    ) => {
      return (state = {
        ...state,
        title: { ...state.title, [key]: title },
      });
    },
    setSize: (
      state,
      { payload: { key, size } }: { payload: { key: SORT_FILTER_KEYS; size: number } },
    ) => {
      return (state = {
        ...state,
        size: { ...state.size, [key]: state.size[key] + size },
      });
    },
    setSort: (
      state,
      { payload: { key, sort } }: { payload: { key: SORT_FILTER_KEYS; sort: SORT_TYPE } },
    ) => {
      return (state = { ...state, sort: { ...state.sort, [key]: sort } });
    },
    setOrder: (
      state,
      { payload: { key, order } }: { payload: { key: SORT_FILTER_KEYS; order: SORT_ORDER } },
    ) => {
      return (state = { ...state, order: { ...state.order, [key]: order } });
    },
    setGenre: (
      state,
      { payload: { key, genre } }: { payload: { key: SORT_FILTER_KEYS; genre: string } },
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

export const { setSize, setNameSearch, setTitleSearch, setSort, setOrder, setGenre } =
  sortFilterSlice.actions;

export default sortFilterSlice.reducer;
