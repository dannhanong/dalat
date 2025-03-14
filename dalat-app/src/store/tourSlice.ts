import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TourTemplate {
  id: number;
  name: string;
  // Thêm các thuộc tính khác của tourTemplates
}

interface TourState {
  templates: TourTemplate[];
  loading: boolean;
  error: string | null;
}

const initialState: TourState = {
  templates: [],
  loading: false,
  error: null,
};

const tourSlice = createSlice({
  name: 'tour',
  initialState,
  reducers: {
    setTourTemplates: (state, action: PayloadAction<TourTemplate[]>) => {
      state.templates = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setTourTemplates, setLoading, setError } = tourSlice.actions;
export default tourSlice.reducer;