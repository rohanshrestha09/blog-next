import { createSlice } from '@reduxjs/toolkit';
import { PROFILE_SIDER_KEYS } from '../constants/reduxKeys';

const { AUTH_FOLLOWERS, USER_FOLLOWERS } = PROFILE_SIDER_KEYS;

const followersSice = createSlice({
  name: 'followers',
  initialState: {
    authKey: AUTH_FOLLOWERS,
    userKey: USER_FOLLOWERS,
    pageSize: Object.values(PROFILE_SIDER_KEYS)
      .map((key) => ({ [key]: 20 }))
      .reduce((prev, curr) => ({ ...prev, ...curr })),
    search: Object.values(PROFILE_SIDER_KEYS)
      .map((key) => ({ [key]: '' }))
      .reduce((prev, curr) => ({ ...prev, ...curr })),
  },
  reducers: {
    changeKey: (
      state,
      {
        payload: { key, type },
      }: { payload: { key: PROFILE_SIDER_KEYS; type: 'authKey' | 'userKey' } }
    ) => {
      return (state = { ...state, [type]: key });
    },
    setPageSize: (
      state,
      { payload: { key, pageSize } }: { payload: { key: PROFILE_SIDER_KEYS; pageSize: number } }
    ) => {
      return (state = { ...state, pageSize: { ...state.pageSize, [key]: pageSize } });
    },
    setSearch: (
      state,
      { payload: { key, search } }: { payload: { key: PROFILE_SIDER_KEYS; search: string } }
    ) => {
      return (state = { ...state, search: { ...state.search, [key]: search } });
    },
  },
});

export const { changeKey, setPageSize, setSearch } = followersSice.actions;

export default followersSice.reducer;
