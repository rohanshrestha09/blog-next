import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './modalSlice';
import drawerReducer from './drawerSlice';
import authBlogReducer from './authBlogSlice';
import bookmarkReducer from './bookmarkSlice';
import followersReducer from './followersSlice';

const store = configureStore({
  reducer: {
    modal: modalReducer,
    drawer: drawerReducer,
    authBlog: authBlogReducer,
    bookmark: bookmarkReducer,
    followers: followersReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
