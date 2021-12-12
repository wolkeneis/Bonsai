import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {Suspense} from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button} from 'react-native-paper';
import Login from './Login';
import ProfileSettins from './ProfileSettings';

const Stack = createNativeStackNavigator();

const Settings = () => {
  return (
    <Stack.Navigator initialRouteName="Settings">
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
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
    </View>
  );
};

const ProfileScreen = ({navigation}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <ProfileSettins navigation={navigation} />
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

export default Settings;

const styles = StyleSheet.create({
  settingsScreen: {
    marginTop: 8,
  },
  settingButton: {
    margin: 8,
    padding: 16,
  },
});
