import { configureStore } from '@reduxjs/toolkit';
import socialReducer from './socialSlice';

export default configureStore({
  reducer: {
    social: socialReducer,
  },
  middleware: [],
});
