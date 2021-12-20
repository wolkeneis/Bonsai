import {createSlice} from '@reduxjs/toolkit';

export const socialSlice = createSlice({
  name: 'social',
  initialState: {
    connected: undefined,
    profile: undefined,
    connections: undefined,
    privateProfile: undefined,
    privateKey: undefined,
    publicKey: undefined,
    contacts: [],
    users: [],
    userCache: {},
    range: undefined,
    packets: {},
  },
  reducers: {
    setConnected: (state, action) => {
      state.connected = action.payload;
    },

    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setConnections: (state, action) => {
      state.connections = action.payload;
    },
    setPrivateProfile: (state, action) => {
      state.privateProfile = action.payload;
    },

    setPrivateKey: (state, action) => {
      state.privateKey = action.payload;
    },
    setPublicKey: (state, action) => {
      state.publicKey = action.payload;
    },

    setContacts: (state, action) => {
      state.contacts = action.payload;
    },
    addContact: (state, action) => {
      state.contacts.push(action.payload);
    },
    removeContact: (state, action) => {
      state.contacts = state.contacts.filter(item => item !== action.payload);
    },
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    setUser: (state, action) => {
      state.userCache[action.payload.id] = action.payload;
    },
    setRange: (state, action) => {
      state.range = action.payload;
    },
    setPacket: (state, action) => {
      state.packets[action.payload.packetId] = action.payload;
    },
  },
});

export const {setConnected} = socialSlice.actions;
export const {setProfile, setConnections, setPrivateProfile} =
  socialSlice.actions;
export const {setPrivateKey, setPublicKey} = socialSlice.actions;
export const {
  setContacts,
  addContact,
  removeContact,
  addUser,
  setUser,
  setPacket,
} = socialSlice.actions;

export default socialSlice.reducer;
