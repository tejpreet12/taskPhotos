import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UploadState {
    progress: number;
}

const initialState: UploadState = {
    progress: 0,
};

const uploadSlice = createSlice({
    name: 'upload',
    initialState,
    reducers: {
        setUploadProgress: (state, action: PayloadAction<number>) => {
            state.progress = action.payload; // Update the upload progress
        },
        resetUploadProgress: (state) => {
            state.progress = 0; // Reset progress
        },
    },
});

export const { setUploadProgress, resetUploadProgress } = uploadSlice.actions;
export default uploadSlice.reducer; 