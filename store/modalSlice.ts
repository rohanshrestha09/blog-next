import { createSlice } from '@reduxjs/toolkit';
import { MODALS } from 'constants/reduxKeys';

const getState = (key: MODALS) => {
  return { [key]: { isOpen: false } };
};

const modalSlice = createSlice({
  name: 'modal',
  initialState: {
    ...getState(MODALS.LOGIN_MODAL),
    ...getState(MODALS.REGISTER_MODAL),
    ...getState(MODALS.DELETE_MODAL),
    ...getState(MODALS.EDIT_PROFILE_MODAL),
    ...getState(MODALS.AUTH_FOLLOWER_MODAL),
    ...getState(MODALS.USER_FOLLOWER_MODAL),
    ...getState(MODALS.PASSWORD_AUTH_MODAL),
    ...getState(MODALS.DISCUSSION_MODAL),
    ...getState(MODALS.LIKE_MODAL),
    ...getState(MODALS.USER_SUGGESTION_MODAL),
    ...getState(MODALS.CHANGE_PASSWORD_MODAL),
    ...getState(MODALS.DELETE_ACCOUNT_MODAL),
    ...getState(MODALS.COMPLETE_PROFILE_MODAL),
  },
  reducers: {
    openModal: (state, { payload }: { payload: MODALS }) => {
      return (state = { ...state, [payload]: { isOpen: true } });
    },
    closeModal: (state, { payload }: { payload: MODALS }) => {
      return (state = { ...state, [payload]: { isOpen: false } });
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;

export default modalSlice.reducer;
