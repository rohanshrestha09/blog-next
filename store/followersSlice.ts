import { createSlice } from '@reduxjs/toolkit';
import { FOLLOWERS_KEYS } from '../constants/reduxKeys';

const { AUTH_FOLLOWERS, USER_FOLLOWERS } = FOLLOWERS_KEYS;

const followersSice = createSlice({
  name: 'followers',
  initialState: {
    authKey: AUTH_FOLLOWERS,
    userKey: USER_FOLLOWERS,
  },
  reducers: {
    changeKey: (
      state,
      { payload: { key, type } }: { payload: { key: FOLLOWERS_KEYS; type: 'authKey' | 'userKey' } }
    ) => {
      return (state = { ...state, [type]: key });
    },
  },
});

export const { changeKey } = followersSice.actions;

export default followersSice.reducer;
