import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './modalSlice';
import drawerReducer from './drawerSlice';
import authBlogReducer from './authBlogSlice';
import followersReducer from './followersSlice';
import sortFilterReducer from './sortFilterSlice';
import readingModeReducer from './readingModeSlice';

const store = configureStore({
  reducer: {
    modal: modalReducer,
    drawer: drawerReducer,
    authBlog: authBlogReducer,
    followers: followersReducer,
    sortFilter: sortFilterReducer,
    readingMode: readingModeReducer,
  },
});

export default store;

declare global {
  type RootState = ReturnType<typeof store.getState>;
}

export type AppDispatch = typeof store.dispatch;
