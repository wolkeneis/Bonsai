import {setConnected, setContacts} from '../redux/socialSlice';
import store from '../redux/store';
import {fetchUserProfile} from './signal';

function fetchContacts() {
  return fetch(
    new Request(
      `${
        process.env.REACT_APP_WALDERDE_NODE || 'https://walderde.wolkeneis.dev'
      }/profile/contacts`,
      {
        method: 'POST',
        credentials: 'include',
      },
    ),
  )
    .then(response => response.json())
    .then(contacts => contacts)
    .catch(() => null);
}

function fetchContactProfiles() {
  return new Promise((resolve, reject) => {
    fetchContacts().then(contacts => {
      if (contacts !== undefined) {
        store.dispatch(setContacts(contacts));
        const userCache = store.getState().social.userCache;
        for (const contact of contacts) {
          if (!Object.keys(userCache).includes(contact)) {
            fetchUserProfile(contact);
          }
        }
        resolve();
      } else {
        store.dispatch(setConnected(false));
        reject();
      }
    });
  });
}

function addContact(userId) {
  return fetch(
    new Request(
      `${
        process.env.REACT_APP_WALDERDE_NODE || 'https://walderde.wolkeneis.dev'
      }/profile/addcontact`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: userId,
        }),
      },
    ),
  )
    .then(() => true)
    .catch(() => false);
}

function removeContact(userId) {
  return fetch(
    new Request(
      `${
        process.env.REACT_APP_WALDERDE_NODE || 'https://walderde.wolkeneis.dev'
      }/profile/removecontact`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: userId,
        }),
      },
    ),
  )
    .then(() => true)
    .catch(() => false);
}

export {fetchContacts, fetchContactProfiles, addContact, removeContact};
