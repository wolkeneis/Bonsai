import {REACT_APP_WALDERDE_NODE} from '@env';
import {setConnections, setPrivateProfile} from '../redux/socialSlice';
import store from '../redux/store';
import {reconnect} from './signal';

const providers = [
  {
    id: 'discord',
    name: 'Discord',
    icon: 'discord',
  },
  {
    id: 'github',
    name: 'Github',
    icon: 'github',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: 'spotify',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: 'twitter',
  },
];

function fetchProfile() {
  return fetch(
    new Request(
      `${
        process.env.REACT_APP_WALDERDE_NODE || 'https://walderde.wolkeneis.dev'
      }/profile`,
      {
        method: 'POST',
        credentials: 'include',
      },
    ),
  )
    .then(response => response.json())
    .then(profile => profile)
    .catch(() => null);
}

function logout() {
  return fetch(
    new Request(
      `${
        REACT_APP_WALDERDE_NODE || 'https://walderde.wolkeneis.dev'
      }/profile/logout`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    ),
  )
    .then(() => reconnect())
    .catch(() => reconnect());
}

function fetchProfileConnections() {
  fetch(
    new Request(
      `${
        REACT_APP_WALDERDE_NODE || 'https://walderde.wolkeneis.dev'
      }/profile/connections`,
      {
        method: 'POST',
        credentials: 'include',
      },
    ),
  )
    .then(response => response.json())
    .then(connections => connections)
    .catch(() => null)
    .then(connections => store.dispatch(setConnections(connections)));
}

function updatePrivacy(privateProfile) {
  fetch(
    new Request(
      `${
        REACT_APP_WALDERDE_NODE || 'https://walderde.wolkeneis.dev'
      }/profile/privacy`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          private: privateProfile,
        }),
      },
    ),
  )
    .then(response => response.json())
    .then(profile => profile)
    .catch(() => {})
    .then(profile => {
      store.dispatch(setPrivateProfile(profile ? profile.private : false));
    });
}

export {providers};
export {fetchProfile, logout, fetchProfileConnections, updatePrivacy};
