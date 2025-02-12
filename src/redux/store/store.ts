import {configureStore} from '@reduxjs/toolkit';
import photoReducer from '../slice/photoslice';

export const store = configureStore({
  reducer: {
    photos: photoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
