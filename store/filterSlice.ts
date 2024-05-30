import { createSlice } from '@reduxjs/toolkit';
import { Genre } from 'interface/models';
import { FILTERS, SORT_ORDER, SORT_TYPE } from '../constants/reduxKeys';

const getState = (key: FILTERS) => {
  return {
    [key]: {
      size: 20,
      genre: [] as Genre[],
      search: '',
      sort: SORT_TYPE.LIKE_COUNT,
      order: SORT_ORDER.DESC,
      isPublished: undefined as undefined | boolean,
    },
  };
};

const sortFilterSlice = createSlice({
  name: 'sortFilter',
  initialState: {
    ...getState(FILTERS.HOME_BLOG_FILTER),
    ...getState(FILTERS.FOLLOWING_BLOG_FILTER),
    ...getState(FILTERS.USER_SUGGESTION_FILTER),
    ...getState(FILTERS.GENERIC_BLOG_FILTER),
    ...getState(FILTERS.BOOKMARK_FILTER),
    ...getState(FILTERS.NOTIFICATION_FILTER),
    ...getState(FILTERS.LIKE_FILTER),
    ...getState(FILTERS.COMMENT_FILTER),
    ...getState(FILTERS.AUTH_PROFILE_FILTER),
    ...getState(FILTERS.USER_PROFILE_FILTER),
    ...getState(FILTERS.AUTH_FOLLOWER_FILTER),
    ...getState(FILTERS.AUTH_FOLLOWING_FILTER),
    ...getState(FILTERS.USER_FOLLOWER_FILTER),
    ...getState(FILTERS.USER_FOLLOWING_FILTER),
  },
  reducers: {
    setSearch: (state, { payload }: { payload: { key: FILTERS; search: string } }) => {
      return (state = {
        ...state,
        [payload.key]: {
          ...state[payload.key],
          search: payload.search,
        },
      });
    },
    setSize: (state, { payload }: { payload: { key: FILTERS; size: number } }) => {
      return (state = {
        ...state,
        [payload.key]: {
          ...state[payload.key],
          size: payload.size,
        },
      });
    },
    setSort: (state, { payload }: { payload: { key: FILTERS; sort: SORT_TYPE } }) => {
      return (state = {
        ...state,
        [payload.key]: {
          ...state[payload.key],
          sort: payload.sort,
        },
      });
    },
    setOrder: (state, { payload }: { payload: { key: FILTERS; order: SORT_ORDER } }) => {
      return (state = {
        ...state,
        [payload.key]: {
          ...state[payload.key],
          order: payload.order,
        },
      });
    },
    setGenre: (state, { payload }: { payload: { key: FILTERS; genre: Genre } }) => {
      return (state = state[payload.key].genre.includes(payload.genre)
        ? {
            ...state,
            [payload.key]: {
              ...state[payload.key],
              genre: state[payload.key].genre.filter((val: string) => val !== payload.genre),
            },
          }
        : {
            ...state,
            [payload.key]: {
              ...state[payload.key],
              genre: [...state[payload.key].genre, payload.genre],
            },
          });
    },
    setPublished: (state, { payload }: { payload: { key: FILTERS; isPublished?: boolean } }) => {
      return (state = {
        ...state,
        [payload.key]: {
          ...state[payload.key],
          isPublished: payload.isPublished,
        },
      });
    },
  },
});

export const { setSize, setSearch, setSort, setOrder, setGenre, setPublished } =
  sortFilterSlice.actions;

export default sortFilterSlice.reducer;
