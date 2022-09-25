import { configureStore } from '@reduxjs/toolkit';
import registerModalReducer from './registerModalSlice';
import loginModalReducer from './loginModalSlice';
import deleteModalReducer from './deleteModalSlice';

const store = configureStore({
  reducer: {
    registerModal: registerModalReducer,
    loginModal: loginModalReducer,
    deleteModal: deleteModalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
