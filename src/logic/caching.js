import AsyncStorage from '@react-native-async-storage/async-storage';
import SInfo from 'react-native-sensitive-info';
import {setUseAllConnectionTypes} from '../redux/configSlice';
import {
  addUser,
  setContacts,
  setPacket,
  setPrivateProfile,
  setProfile,
  setUser,
} from '../redux/socialSlice';
import store from '../redux/store';
import {deleteKeyPair} from './signal';

function loadCache() {
  return Promise.all([loadConfig(), loadProfile(), loadUsers(), loadPackets()]);
}

function deleteCache() {
  deleteProfile();
  deleteKeyPair();
  deleteUsers();
  deletePackets();
}

function cacheConfig() {
  const state = store.getState();
  AsyncStorage.setItem(
    'config',
    JSON.stringify({
      useAllConnectionTypes: state.config.useAllConnectionTypes,
    }),
  ).catch(() => {});
}

function loadConfig() {
  return AsyncStorage.getItem('config')
    .then(config => JSON.parse(config))
    .catch(() => {})
    .then(config => {
      store.dispatch(setUseAllConnectionTypes(config.useAllConnectionTypes));
    });
}

function deleteConfig() {
  AsyncStorage.multiRemove(['config']);
}

function cacheProfile() {
  const state = store.getState();
  AsyncStorage.setItem('profile', JSON.stringify(state.social.profile)).catch(
    () => {},
  );
  AsyncStorage.setItem(
    'privateProfile',
    JSON.stringify(state.social.privateProfile),
  ).catch(() => {});
}

function loadProfile() {
  return Promise.all([
    AsyncStorage.getItem('profile')
      .then(profile => JSON.parse(profile))
      .catch(() => null)
      .then(profile => {
        if (profile) {
          store.dispatch(setProfile(profile));
        }
      }),
    AsyncStorage.getItem('privateProfile')
      .then(privateProfile => JSON.parse(privateProfile))
      .catch(() => null)
      .then(privateProfile => {
        if (privateProfile) {
          store.dispatch(setPrivateProfile(privateProfile));
        }
      }),
  ]);
}

function deleteProfile() {
  AsyncStorage.multiRemove(['profile', 'privateProfile']);
}

function cacheUsers() {
  const state = store.getState();
  AsyncStorage.setItem('contacts', JSON.stringify(state.social.contacts)).catch(
    () => {},
  );
  AsyncStorage.setItem('users', JSON.stringify(state.social.users)).catch(
    () => {},
  );
  AsyncStorage.setItem(
    'userCache',
    JSON.stringify(state.social.userCache),
  ).catch(() => {});
}

function loadUsers() {
  return Promise.all([
    AsyncStorage.getItem('contacts')
      .then(contacts => JSON.parse(contacts))
      .catch(() => null)
      .then(contacts => {
        if (contacts) {
          store.dispatch(setContacts(contacts));
        }
      }),
    AsyncStorage.getItem('users')
      .then(users => JSON.parse(users))
      .catch(() => null)
      .then(users => {
        if (users) {
          for (const user of users) {
            store.dispatch(addUser(user));
          }
        }
      }),
    AsyncStorage.getItem('userCache')
      .then(userCache => JSON.parse(userCache))
      .catch(() => null)
      .then(userCache => {
        if (userCache) {
          for (const userId in userCache) {
            if (Object.hasOwnProperty.call(userCache, userId)) {
              store.dispatch(setUser(userCache[userId]));
            }
          }
        }
      }),
  ]);
}

function deleteUsers() {
  AsyncStorage.multiRemove(['contacts', 'users', 'userCache']);
}

function cachePackets() {
  const state = store.getState();
  SInfo.setItem('packets', JSON.stringify(state.social.packets), {});
}

function loadPackets() {
  return SInfo.getItem('packets', {})
    .then(string => {
      return string;
    })
    .then(packets => JSON.parse(packets))
    .catch(() => null)
    .then(packets => {
      if (packets) {
        for (const packetId in packets) {
          if (Object.hasOwnProperty.call(packets, packetId)) {
            store.dispatch(setPacket(packets[packetId]));
          }
        }
      }
    });
}

function deletePackets() {
  SInfo.deleteItem('packets', {});
}

export {
  loadCache,
  deleteCache,
  cacheConfig,
  cacheProfile,
  cacheUsers,
  cachePackets,
};
