import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './modalSlice';
import drawerReducer from './drawerSlice';
import filterReducer from './filterSlice';
import readingModeReducer from './readingModeSlice';

const store = configureStore({
  reducer: {
    modal: modalReducer,
    drawer: drawerReducer,
    filter: filterReducer,
    readingMode: readingModeReducer,
  },
});

export default store;

declare global {
  type RootState = ReturnType<typeof store.getState>;
}

export type AppDispatch = typeof store.dispatch;
