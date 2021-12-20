import {createSlice} from '@reduxjs/toolkit';

export const interfaceSlice = createSlice({
  name: 'interface',
  initialState: {
    showProfileWarning: false,
    showSecurityWarning: false,
    askIfBackupIsDesired: false,
    remoteKeyPair: undefined,
    askForDecryptionKey: false,
    askToLogIn: false,
  },
  reducers: {
    setShowProfileWarning: (state, action) => {
      state.showProfileWarning = action.payload;
    },
    setShowSecurityWarning: (state, action) => {
      state.showSecurityWarning = action.payload;
    },
    setAskIfBackupIsDesired: (state, action) => {
      state.askIfBackupIsDesired = action.payload;
    },
    setRemoteKeyPair: (state, action) => {
      state.remoteKeyPair = action.payload;
    },
    setAskForDecryptionKey: (state, action) => {
      state.askForDecryptionKey = action.payload;
    },
    setAskToLogIn: (state, action) => {
      state.askToLogIn = action.payload;
    },
  },
});

export const {
  setShowProfileWarning,
  setShowSecurityWarning,
  setAskIfBackupIsDesired,
  setRemoteKeyPair,
  setAskForDecryptionKey,
  setAskToLogIn,
} = interfaceSlice.actions;

export default interfaceSlice.reducer;
