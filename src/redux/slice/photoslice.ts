import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PhotoIdentifier } from '@react-native-camera-roll/camera-roll';

interface PhotoState {
  selectedPhotos: PhotoIdentifier[];
}

const initialState: PhotoState = {
  selectedPhotos: [],
};

const photoSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    setSelectedPhotos: (state, action: PayloadAction<PhotoIdentifier[]>) => {
      state.selectedPhotos = action.payload;
    },
    clearSelectedPhotos: (state) => {
      state.selectedPhotos = [];
    },
  },
});

export const { setSelectedPhotos, clearSelectedPhotos } = photoSlice.actions;
export default photoSlice.reducer;