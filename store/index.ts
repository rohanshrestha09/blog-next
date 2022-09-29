import { configureStore } from '@reduxjs/toolkit';
import registerModalReducer from './registerModalSlice';
import loginModalReducer from './loginModalSlice';
import deleteModalReducer from './deleteModalSlice';
import drawerReducer from './drawerSlice';
import authBlogReducer from './authBlogSlice';

const store = configureStore({
  reducer: {
    registerModal: registerModalReducer,
    loginModal: loginModalReducer,
    deleteModal: deleteModalReducer,
    drawer: drawerReducer,
    authBlog: authBlogReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
