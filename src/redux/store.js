import {configureStore} from '@reduxjs/toolkit';
import configReducer from './configSlice';
import interfaceReducer from './interfaceSlice';
import socialReducer from './socialSlice';

export default configureStore({
  reducer: {
    config: configReducer,
    interface: interfaceReducer,
    social: socialReducer,
  },
  middleware: [],
});
