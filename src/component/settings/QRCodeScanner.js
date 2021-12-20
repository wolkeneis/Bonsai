import React, {useEffect, useState} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {Snackbar} from 'react-native-paper';
import {openSettings} from 'react-native-permissions';
import {default as QRCodeScannerComponent} from 'react-native-qrcode-scanner';
import {useDispatch, useSelector} from 'react-redux';
import {addContact as addRemoteContact} from '../../logic/contacts';
import {addContact} from '../../redux/socialSlice';

const QRCodeScanner = ({navigation}) => {
  const dispatch = useDispatch();
  const connected = useSelector(state => state.social.connected);
  const [connectionWarningVisible, setConnectionWarningVisible] =
    useState(false);
  const [androidPermissionWarningVisible, setAndroidPermissionWarningVisible] =
    useState(false);

  useEffect(() => {
    if (Platform.OS === 'android' && Platform.constants.Release > 10) {
      setAndroidPermissionWarningVisible(true);
    }
  }, []);

  const onSuccess = event => {
    if (!connected) {
      return setConnectionWarningVisible(true);
    }
    const matches = event.data.match(
      /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/,
    );
    if (matches.length >= 1) {
      const userId = matches[0];
      addRemoteContact(userId).then(successful => {
        if (successful) {
          dispatch(addContact(userId));
          navigation.goBack();
        }
      });
    }
  };

  return (
    <View style={styles.qrcodescannerScreen}>
      <QRCodeScannerComponent
        showMarker
        reactivate
        reactivateTimeout={500}
        onRead={onSuccess}
      />
      <Snackbar
        visible={connectionWarningVisible}
        onDismiss={() => setConnectionWarningVisible(false)}
        action={{
          label: 'Hide',
          onPress: () => setConnectionWarningVisible(false),
        }}>
        You're offline, check your connection and try again!
      </Snackbar>
      <Snackbar
        visible={androidPermissionWarningVisible}
        onDismiss={() => setAndroidPermissionWarningVisible(false)}
        action={{
          label: 'Settings',
          onPress: () => openSettings().catch(() => {}),
        }}>
        If you have a black screen, change the camera permissions!
      </Snackbar>
    </View>
  );
};

export default QRCodeScanner;

const styles = StyleSheet.create({
  qrcodescannerScreen: {
    flex: 1,
  },
  buttonTouchable: {
    padding: 16,
  },
});
