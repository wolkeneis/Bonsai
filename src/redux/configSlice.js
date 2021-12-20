import {createSlice} from '@reduxjs/toolkit';

export const configSlice = createSlice({
  name: 'config',
  initialState: {
    useAllConnectionTypes: false,
  },
  reducers: {
    setUseAllConnectionTypes: (state, action) => {
      state.useAllConnectionTypes = action.payload;
    },
  },
});

export const {setUseAllConnectionTypes} = configSlice.actions;

export default configSlice.reducer;
