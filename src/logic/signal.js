import NetInfo from '@react-native-community/netinfo';
import {Buffer} from 'buffer';
import forge from 'node-forge';
import E2E from 'react-native-e2e-encryption';
import SInfo from 'react-native-sensitive-info';
import {io} from 'socket.io-client';
import {
  setRemoteKeyPair,
  setShowProfileWarning,
  setShowSecurityWarning,
} from '../redux/interfaceSlice';
import {
  addUser,
  setConnected,
  setPacket,
  setPrivateKey,
  setProfile,
  setPublicKey,
  setRange,
  setUser,
} from '../redux/socialSlice';
import store from '../redux/store';
import {fetchContactProfiles} from './contacts';
import {fetchProfile} from './profile';

const socket = io(
  (process.env.REACT_APP_WALDERDE_NODE || 'https://walderde.wolkeneis.dev') +
    '/chat',
  {withCredentials: true},
);

function reconnect() {
  socket.disconnect();
  socket.connect();
}

socket.on('packet', encryptedPacket => {
  const profile = store.getState().social.profile;
  if (profile) {
    decrypt(encryptedPacket).then(packet => {
      if (packet) {
        store.dispatch(setPacket(packet));
        if (!store.getState().social.users.includes(packet.userId)) {
          store.dispatch(addUser(packet.userId));
        }
      }
    });
  }
});

function fetchPackets() {
  const callback = packets => {
    if (!packets) {
      throw new Error('No messages received!');
    }
    for (let i = 0; i < packets.length; i++) {
      const encryptedPacket = packets[i];
      decrypt(encryptedPacket).then(packet => {
        if (packet) {
          store.dispatch(setPacket(packet));
          if (!store.getState().social.users.includes(packet.userId)) {
            store.dispatch(addUser(packet.userId));
          }
        }
      });
    }
  };
  socket.emit('range', {}, range => {
    if (range === undefined) {
      throw new Error('No messages received!');
    }
    socket.emit('packets', {}, callback);
    if (range > 0) {
      socket.emit(
        'packets',
        {
          start: 0,
          range: Math.min(range, 1000),
        },
        callback,
      );
    }
  });
}

function sendPacket(message, receiver) {
  accessible(receiver).then(accessible => {
    if (accessible) {
      encrypt(message, receiver).then(packet => {
        socket.emit('packet', packet, encryptedPacket => {
          decrypt(encryptedPacket).then(packet => {
            if (packet) {
              store.dispatch(setPacket(packet));
            }
          });
        });
      });
    }
  });
}

function fetchRange() {
  socket.emit('range', {}, range => {
    if (range === undefined) {
      throw new Error('No messages received!');
    }
    store.dispatch(setRange(range));
  });
}

var encryptionInstance;

function initializeKeys() {
  return new Promise(resolve => {
    NetInfo.fetch().then(async state => {
      const connected =
        state.isConnected &&
        state.details &&
        (!state.details.isConnectionExpensive ||
          store.getState().config.useAllConnectionTypes);
      store.dispatch(setConnected(connected));
      if (connected) {
        fetchProfile().then(profile => {
          if (profile !== null) {
            store.dispatch(setProfile(profile));
            fetchContactProfiles().catch(() => {});
            localKeyPairExists().then(localKeyPairExists => {
              if (localKeyPairExists) {
                fetchKeyPair().then(fetchedKeyPair => {
                  if (fetchedKeyPair === null) {
                    store.dispatch(setConnected(false));
                    resolve(-1);
                  } else if (
                    fetchedKeyPair.iv &&
                    fetchedKeyPair.salt &&
                    fetchedKeyPair.privateKey &&
                    fetchedKeyPair.publicKey
                  ) {
                    localKeyPair().then(localKeyPair => {
                      if (fetchedKeyPair.publicKey === localKeyPair.publicKey) {
                        loadLocalKeyPair();
                        fetchPackets();
                        resolve(0);
                      } else {
                        store.dispatch(setShowSecurityWarning(true));
                        resolve(1);
                      }
                    });
                  } else {
                    loadLocalKeyPair();
                    fetchPackets();
                    store.dispatch(setShowSecurityWarning(true));
                    resolve(2);
                  }
                });
              } else {
                fetchKeyPair().then(fetchedKeyPair => {
                  if (fetchedKeyPair === null) {
                    store.dispatch(setConnected(false));
                    resolve(-1);
                  } else if (
                    fetchedKeyPair.iv &&
                    fetchedKeyPair.salt &&
                    fetchedKeyPair.privateKey &&
                    fetchedKeyPair.publicKey
                  ) {
                    store.dispatch(setRemoteKeyPair(fetchedKeyPair));
                    store.dispatch(setShowSecurityWarning(true));
                    resolve(3);
                  } else {
                    generateKeys();
                    uploadPublicKey().catch(() => {});
                    store.dispatch(setShowSecurityWarning(true));
                    resolve(4);
                  }
                });
              }
            });
          } else {
            store.dispatch(setShowProfileWarning(true));
            resolve(-2);
          }
        });
      } else {
        if (await localKeyPairExists()) {
          loadLocalKeyPair();
          resolve(5);
        }
      }
    });
  });
}

async function localKeyPair() {
  return await SInfo.getItem('keyPair', {}).then(keyPair =>
    JSON.parse(keyPair),
  );
}

async function localKeyPairExists() {
  return (await localKeyPair()) !== null;
}

function loadLocalKeyPair() {
  localKeyPair().then(keyPair => {
    if (keyPair) {
      store.dispatch(setPrivateKey(keyPair.privateKey));
      store.dispatch(setPublicKey(keyPair.publicKey));
      encryptionInstance = new E2E(keyPair.publicKey, keyPair.privateKey, {});
    }
  });
}

function storeKeyPair(keyPair) {
  SInfo.setItem('keyPair', JSON.stringify(keyPair), {});
}

function deleteKeyPair() {
  SInfo.deleteItem('keyPair', {});
}

function generateKeys() {
  encryptionInstance = new E2E('', '', {});
  store.dispatch(setPrivateKey(encryptionInstance.privateKey));
  store.dispatch(setPublicKey(encryptionInstance.publicKey));
  const keyPair = {
    privateKey: encryptionInstance.privateKey,
    publicKey: encryptionInstance.publicKey,
  };
  storeKeyPair(keyPair);
  return keyPair;
}

async function decryptKeyPair(encryptedKeyPair, password) {
  return new Promise((resolve, reject) => {
    const keyPair = decryptPrivateKey(encryptedKeyPair, password);
    if (!keyPair) {
      return reject();
    }
    encryptionInstance = new E2E(keyPair.publicKey, keyPair.privateKey, {});
    store.dispatch(setPrivateKey(keyPair.privateKey));
    store.dispatch(setPublicKey(keyPair.publicKey));
    return resolve(keyPair);
  });
}

function fetchUserProfile(userId) {
  const userCache = store.getState().social.userCache;
  if (Object.keys(userCache).includes(userId)) {
    return userCache[userId];
  } else {
    return fetch(
      new Request(
        `${
          process.env.REACT_APP_WALDERDE_NODE ||
          'https://walderde.wolkeneis.dev'
        }/api/user/${userId}/profile`,
        {
          method: 'POST',
          credentials: 'include',
        },
      ),
    )
      .then(response => response.json())
      .then(profile => {
        profile.packets = {};
        store.dispatch(setUser(profile));
        return profile;
      })
      .catch(() => {});
  }
}

async function accessible(userId) {
  const state = store.getState();
  if (state.social.userCache[userId]) {
    return state.social.userCache[userId].username !== undefined;
  } else {
    const profile = await fetchUserProfile(userId);
    return profile.username !== undefined;
  }
}

async function publicKey(userId) {
  const state = store.getState();
  if (state.social.userCache[userId]) {
    return state.social.userCache[userId].publicKey;
  } else {
    const profile = await fetchUserProfile(userId);
    return profile.publicKey;
  }
}

async function encrypt(message, receiver) {
  try {
    return {
      receiver: receiver,
      content: encryptionInstance.Encrypt(
        {message: message, date: Date.now()},
        await publicKey(receiver),
        {},
      ),
    };
  } catch {
    return undefined;
  }
}

async function decrypt(encryptedPacket) {
  const userId = store.getState().social.profile.id;
  const otherUser =
    encryptedPacket.receiver !== userId
      ? encryptedPacket.receiver
      : encryptedPacket.sender;
  try {
    const packet = encryptionInstance.Decrypt(
      encryptedPacket.content,
      await publicKey(otherUser),
      {},
    );
    packet.sender = encryptedPacket.sender === userId;
    packet.userId = otherUser;
    packet.packetId = encryptedPacket.packetId;
    return packet;
  } catch {
    return undefined;
  }
}

function uploadKeyPair(password) {
  const encryptedPrivateKey = encryptPrivateKey(
    store.getState().social.privateKey,
    password,
  );
  const encryptedKeyPair = {
    ...encryptedPrivateKey,
    publicKey: store.getState().social.publicKey,
  };
  return fetch(
    new Request(
      `${
        process.env.REACT_APP_WALDERDE_NODE || 'https://walderde.wolkeneis.dev'
      }/profile/key`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(encryptedKeyPair),
      },
    ),
  );
}

function uploadPublicKey() {
  const keyPair = {
    publicKey: store.getState().social.publicKey,
  };
  return fetch(
    new Request(
      `${
        process.env.REACT_APP_WALDERDE_NODE || 'https://walderde.wolkeneis.dev'
      }/profile/key`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(keyPair),
      },
    ),
  );
}

function fetchKeyPair() {
  return fetch(
    new Request(
      `${
        process.env.REACT_APP_WALDERDE_NODE || 'https://walderde.wolkeneis.dev'
      }/profile/key`,
      {
        credentials: 'include',
      },
    ),
  )
    .then(response => response.json())
    .then(encryptedKeyPair => encryptedKeyPair)
    .catch(() => null);
}

function encryptPrivateKey(privateKey, password) {
  var iv = forge.random.getBytesSync(32);
  var salt = forge.random.getBytesSync(128);
  var key = forge.pkcs5.pbkdf2(password, salt, 120000, 32);
  var cipher = forge.cipher.createCipher('AES-CBC', key);
  cipher.start({iv: iv});
  cipher.update(forge.util.createBuffer(privateKey));
  cipher.finish();
  const encryptedPrivateKey = cipher.output.getBytes();
  return {
    iv: encode64(iv),
    salt: encode64(salt),
    privateKey: encode64(encryptedPrivateKey),
  };
}

function decryptPrivateKey(keyPair, password) {
  if (
    !keyPair ||
    !keyPair.iv ||
    !keyPair.salt ||
    !keyPair.privateKey ||
    !keyPair.publicKey
  ) {
    return undefined;
  }
  const iv = decode64(keyPair.iv);
  const salt = decode64(keyPair.salt);
  const encryptedPrivateKey = decode64(keyPair.privateKey);
  var key = forge.pkcs5.pbkdf2(password, salt, 120000, 32);
  var decipher = forge.cipher.createDecipher('AES-CBC', key);
  decipher.start({iv: iv});
  decipher.update(forge.util.createBuffer(encryptedPrivateKey));
  var result = decipher.finish();
  if (!result) {
    return undefined;
  }
  const privateKey = decipher.output.getBytes();
  if (privateKey.length !== 44) {
    return undefined;
  }
  return {
    privateKey: privateKey,
    publicKey: keyPair.publicKey,
  };
}

function encode64(bytes) {
  return Buffer.from(bytes).toString('base64');
}

function decode64(base64) {
  return Buffer.from(base64, 'base64').toString();
}

export {
  reconnect,
  initializeKeys,
  localKeyPairExists,
  localKeyPair,
  generateKeys,
  uploadKeyPair,
  uploadPublicKey,
  decryptKeyPair,
  fetchUserProfile,
  fetchKeyPair,
  storeKeyPair,
  deleteKeyPair,
  fetchProfile,
  fetchPackets,
  fetchRange,
  sendPacket,
};
