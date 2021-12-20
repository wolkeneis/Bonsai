import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {Suspense} from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button} from 'react-native-paper';
import ContactSettings from './ContactSettings';
import Login from './Login';
import ProfileSettings from './ProfileSettings';
import QRCode from './QRCode';
import QRCodeScanner from './QRCodeScanner';
import SecuritySettings from './SecuritySettings';

const Stack = createNativeStackNavigator();

const Settings = () => {
  return (
    <Stack.Navigator initialRouteName="Settings">
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="Contacts" component={ContactScreen} />
      <Stack.Screen name="QR Code" component={QRCodeScreen} />
      <Stack.Screen name="QR Code Scanner" component={QRCodeScannerScreen} />
    </Stack.Navigator>
  );
};

const SettingsScreen = ({navigation}) => {
  return (
    <View style={styles.settingsScreen}>
      <Button
        style={styles.settingButton}
        icon="account-circle"
        mode="contained"
        onPress={() => navigation.navigate('Profile')}>
        Profile
      </Button>
      <Button
        style={styles.settingButton}
        icon="shield-lock-outline"
        mode="contained"
        onPress={() => navigation.navigate('Security')}>
        Security
      </Button>
      <Button
        style={styles.settingButton}
        icon="contacts"
        mode="contained"
        onPress={() => navigation.navigate('Contacts')}>
        Contacts
      </Button>
    </View>
  );
};

const ProfileScreen = ({navigation}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <ProfileSettings navigation={navigation} />
    </Suspense>
  );
};

const LoginScreen = ({navigation, route}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <Login
        navigation={navigation}
        provider={
          route.params && route.params.provider
            ? route.params.provider
            : undefined
        }
      />
    </Suspense>
  );
};

const SecurityScreen = ({navigation}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SecuritySettings navigation={navigation} />
    </Suspense>
  );
};

const ContactScreen = ({navigation}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <ContactSettings navigation={navigation} />
    </Suspense>
  );
};

const QRCodeScreen = ({navigation}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <QRCode navigation={navigation} />
    </Suspense>
  );
};

const QRCodeScannerScreen = ({navigation}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <QRCodeScanner navigation={navigation} />
    </Suspense>
  );
};

export default Settings;

const styles = StyleSheet.create({
  settingsScreen: {
    paddingVertical: 8,
  },
  settingButton: {
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
  },
});
