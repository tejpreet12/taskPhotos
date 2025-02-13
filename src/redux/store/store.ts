import {configureStore} from '@reduxjs/toolkit';
import photoReducer from '../slice/photoslice';
import uploadSlice from '../slice/uploadSlice';

export const store = configureStore({
  reducer: {
    photos: photoReducer,
    upload: uploadSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
