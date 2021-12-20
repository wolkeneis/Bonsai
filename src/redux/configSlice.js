import {createSlice} from '@reduxjs/toolkit';

export const configSlice = createSlice({
  name: 'config',
  initialState: {
    doneLoading: false,
    useAllConnectionTypes: true,
  },
  reducers: {
    setDoneLoading: state => {
      state.doneLoading = true;
    },
    setUseAllConnectionTypes: (state, action) => {
      state.useAllConnectionTypes = action.payload;
    },
  },
});

export const {setDoneLoading, setUseAllConnectionTypes} = configSlice.actions;

export default configSlice.reducer;
