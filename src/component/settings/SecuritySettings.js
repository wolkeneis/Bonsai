import {useNetInfo} from '@react-native-community/netinfo';
import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Colors,
  List,
  Modal,
  Text,
  TextInput,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import zxcvbn from 'zxcvbn';
import {
  decryptKeyPair,
  deleteKeyPair,
  fetchKeyPair,
  fetchProfile,
  generateKeys,
  localKeyPair as fetchLocalKeyPair,
  localKeyPairExists,
  storeKeyPair,
  uploadKeyPair,
  uploadPublicKey,
} from '../../logic/signal';
import {
  setAskForDecryptionKey,
  setAskIfBackupIsDesired,
  setShowProfileWarning,
} from '../../redux/interfaceSlice';
import {setConnected, setProfile} from '../../redux/socialSlice';
import store from '../../redux/store';

const SecuritySettings = ({navigation}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [localKeyPair, setLocalKeyPair] = useState();
  const [remoteKeyPair, setRemoteKeyPair] = useState();
  const [backupPossible, setBackupPossible] = useState(false);
  const [decryptionKeyNeeded, setDecryptionKeyNeeded] = useState(false);
  const [mergePossible, setMergePossible] = useState(false);
  const connected = useSelector(state => state.social.connected);
  const netInfo = useNetInfo();
  const dispatch = useDispatch();
  const profile = useSelector(state => state.social.profile);
  const askForDecryptionKey = useSelector(
    state => state.interface.askForDecryptionKey,
  );
  const askIfBackupIsDesired = useSelector(
    state => state.interface.askIfBackupIsDesired,
  );
  const [working, setWorking] = useState(false);
  const [password, setPassword] = useState();
  const [warning, setWarning] = useState();
  const [strength, setStrength] = useState();
  const [suggestions, setSuggestions] = useState();

  const updateSecurityState = useCallback(() => {
    setRefreshing(true);
    setLocalKeyPair(null);
    setRemoteKeyPair(null);
    setBackupPossible(false);
    setDecryptionKeyNeeded(false);
    const connected =
      netInfo.isConnected &&
      netInfo.details &&
      (!netInfo.details.isConnectionExpensive ||
        store.getState().config.useAllConnectionTypes);
    dispatch(setConnected(connected));
    if (connected) {
      fetchProfile().then(profile => {
        if (profile !== null) {
          dispatch(setShowProfileWarning(false));
          dispatch(setProfile(profile));
          localKeyPairExists().then(localKeyPairExists => {
            if (localKeyPairExists) {
              fetchLocalKeyPair().then(localKeyPair =>
                setLocalKeyPair(localKeyPair),
              );
              fetchKeyPair().then(fetchedKeyPair => {
                if (fetchedKeyPair === null) {
                  dispatch(setConnected(false));
                  setRemoteKeyPair(null);
                  setRefreshing(false);
                } else if (
                  fetchedKeyPair.iv &&
                  fetchedKeyPair.salt &&
                  fetchedKeyPair.privateKey &&
                  fetchedKeyPair.publicKey
                ) {
                  setRemoteKeyPair(fetchedKeyPair);
                  fetchLocalKeyPair().then(localKeyPair => {
                    if (fetchedKeyPair.publicKey !== localKeyPair.publicKey) {
                      setMergePossible(true);
                    }
                    setRefreshing(false);
                  });
                } else {
                  setRemoteKeyPair(null);
                  setBackupPossible(true);
                  setRefreshing(false);
                }
              });
            } else {
              fetchKeyPair().then(fetchedKeyPair => {
                if (fetchedKeyPair === null) {
                  dispatch(setConnected(false));
                  setRemoteKeyPair(null);
                  setRefreshing(false);
                } else if (
                  fetchedKeyPair.iv &&
                  fetchedKeyPair.salt &&
                  fetchedKeyPair.privateKey &&
                  fetchedKeyPair.publicKey
                ) {
                  setRemoteKeyPair(fetchedKeyPair);
                  setDecryptionKeyNeeded(true);
                  setRefreshing(false);
                } else {
                  setLocalKeyPair(generateKeys());
                  uploadPublicKey().catch(() => {});
                  setBackupPossible(true);
                  setRefreshing(false);
                }
              });
            }
          });
        } else {
          dispatch(setShowProfileWarning(true));
          setRefreshing(false);
        }
      });
    } else {
      localKeyPairExists().then(localKeyPairExists => {
        if (localKeyPairExists) {
          fetchLocalKeyPair().then(localKeyPair => {
            setLocalKeyPair(localKeyPair);
            setRefreshing(false);
          });
        }
      });
    }
  }, [dispatch, netInfo]);

  useEffect(() => {
    updateSecurityState();
  }, [netInfo, updateSecurityState]);

  const tryPassword = () => {
    setWarning();
    setWorking(true);
    setTimeout(() => {
      decryptKeyPair(remoteKeyPair, password)
        .then(keyPair => {
          if (keyPair) {
            storeKeyPair(keyPair);
            dispatch(setAskForDecryptionKey(false));
          }
          updateSecurityState();
          setWorking(false);
        })
        .catch(() => {
          setWorking(false);
          setWarning('Invalid decryption key. try again');
        });
    }, 250);
  };

  const uploadBackup = () => {
    setWorking(true);
    setTimeout(() => {
      const result = zxcvbn(password);
      if (result.score > 3) {
        uploadKeyPair(password).then(() => {
          dispatch(setAskIfBackupIsDesired(false));
          updateSecurityState();
        });
        setWorking(false);
      } else {
        setWorking(false);
      }
    }, 250);
  };

  const onChange = password => {
    setPassword(password);
    if (password) {
      const result = zxcvbn(password);
      setSuggestions(result.feedback.suggestions);
      setWarning(result.feedback.warning);
      setStrength(result.score);
    }
  };

  const deleteLocalKeyPair = () => {
    deleteKeyPair();
    updateSecurityState();
  };

  const alertAvatar = () => (
    <Avatar.Icon
      style={{
        backgroundColor: Colors.yellow500,
        ...styles.statusAvatar,
      }}
      size={40}
      icon="alert-circle-outline"
    />
  );

  const informationAvatar = () => (
    <Avatar.Icon
      style={{
        backgroundColor: Colors.greenA400,
        ...styles.statusAvatar,
      }}
      size={40}
      icon="information-outline"
    />
  );

  const checkAvatar = () => (
    <Avatar.Icon
      style={{
        backgroundColor: Colors.green800,
        ...styles.statusAvatar,
      }}
      size={40}
      icon="check"
    />
  );

  return (
    <>
      <ScrollView
        style={styles.settings}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => updateSecurityState()}
          />
        }>
        <Card style={styles.remoteCard}>
          <Card.Cover source={{uri: 'https://picsum.photos/1200'}} />
          <Card.Title title="Backup" />
          <Card.Content>
            <List.Section>
              {mergePossible && (
                <List.Item
                  title="Private Key Merge"
                  description="The private key on the device and in the cloud do not match! This can result in missed messages and the inability to contact others."
                  descriptionNumberOfLines={8}
                  left={alertAvatar}
                />
              )}
              {backupPossible && (
                <List.Item
                  title="Backup possible"
                  description="Your private key is not backed up in the cloud. That means if you uninstall this app or lose access to the device, your messages will be lost. Also, you cannot use any other device to chat with others."
                  descriptionNumberOfLines={8}
                  left={informationAvatar}
                />
              )}
              {decryptionKeyNeeded && (
                <List.Item
                  title="Decryption Key Needed"
                  description="To access the private key backup in the cloud to access your previously written messages, you will need to enter your password."
                  descriptionNumberOfLines={8}
                  left={alertAvatar}
                />
              )}
              {!connected && (
                <List.Item
                  title="Internet Connection"
                  description="You are not connected to the Internet!"
                  descriptionNumberOfLines={8}
                  left={alertAvatar}
                />
              )}
              {!profile && (
                <List.Item
                  title="Profile"
                  description="You are not logged in!"
                  descriptionNumberOfLines={8}
                  left={alertAvatar}
                />
              )}
              {localKeyPair && remoteKeyPair && !mergePossible && connected && (
                <List.Item
                  title="Backup"
                  description="Your private key is backed up in the cloud."
                  descriptionNumberOfLines={8}
                  left={checkAvatar}
                />
              )}
            </List.Section>
          </Card.Content>
          <Card.Actions>
            {backupPossible && (
              <Button onPress={() => dispatch(setAskIfBackupIsDesired(true))}>
                Backup
              </Button>
            )}
            {decryptionKeyNeeded && (
              <Button onPress={() => dispatch(setAskForDecryptionKey(true))}>
                Decrypt
              </Button>
            )}
            {localKeyPair && remoteKeyPair && !mergePossible && connected && (
              <Button onPress={() => deleteLocalKeyPair()}>
                Delete Local Key
              </Button>
            )}
          </Card.Actions>
        </Card>
      </ScrollView>
      <Modal
        visible={askForDecryptionKey && remoteKeyPair}
        onDismiss={() => dispatch(setAskForDecryptionKey(false))}>
        <Card style={styles.decryptionKeyModal}>
          <Card.Cover source={{uri: 'https://picsum.photos/seed/key/800'}} />
          <Card.Title
            title="End to End Encryption"
            subtitle="Please enter your password to decrypt your private encryption key."
            subtitleNumberOfLines={4}
          />
          <Card.Content>
            <TextInput
              secureTextEntry={true}
              label="Password"
              value={password}
              onChangeText={text => setPassword(text)}
            />
            {!!warning && <Text style={styles.warning}>{warning}</Text>}
            {working && <ActivityIndicator />}
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => dispatch(setAskForDecryptionKey(false))}>
              Cancel
            </Button>
            <Button onPress={tryPassword}>Decrypt</Button>
          </Card.Actions>
        </Card>
      </Modal>
      <Modal
        visible={askIfBackupIsDesired && localKeyPair}
        onDismiss={() => dispatch(setAskIfBackupIsDesired(false))}>
        <Card style={styles.encryptionKeyModal}>
          <Card.Cover source={{uri: 'https://picsum.photos/seed/key/800'}} />
          <Card.Title
            title="End to End Encryption"
            subtitle="Please enter a password that will be used to encrypt your private key in the cloud."
            subtitleNumberOfLines={4}
          />
          <Card.Content>
            <TextInput
              secureTextEntry={true}
              label="Password"
              value={password}
              onChangeText={onChange}
            />
            <Text
              style={{
                color:
                  strength === 0
                    ? Colors.red900
                    : strength === 1
                    ? Colors.orange900
                    : strength === 2
                    ? Colors.yellow900
                    : strength === 3
                    ? Colors.lightGreen900
                    : strength === 4
                    ? Colors.green900
                    : Colors.pink500,
              }}>
              {strength === 0
                ? 'Very Weak'
                : strength === 1
                ? 'Weak'
                : strength === 2
                ? 'Okay'
                : strength === 3
                ? 'Strong'
                : strength === 4
                ? 'Very Strong'
                : '???'}
            </Text>
            {!!warning && <Text style={styles.warning}>{warning}</Text>}
            {suggestions &&
              suggestions.map(suggestion => (
                <Text key={suggestion} style={styles.suggestion}>
                  {suggestion}
                </Text>
              ))}
            {working && <ActivityIndicator />}
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => dispatch(setAskIfBackupIsDesired(false))}>
              Cancel
            </Button>
            <Button onPress={uploadBackup}>Upload</Button>
          </Card.Actions>
        </Card>
      </Modal>
    </>
  );
};

export default SecuritySettings;

const styles = StyleSheet.create({
  settings: {
    marginVertical: 4,
  },
  remoteCard: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  statusAvatar: {
    margin: 8,
  },
  decryptionKeyModal: {
    margin: 16,
  },
  encryptionKeyModal: {
    margin: 16,
  },
  warning: {
    color: Colors.amber800,
  },
  suggestion: {
    color: Colors.yellow800,
  },
});
