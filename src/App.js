import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useEffect, useState} from 'react';
import {Snackbar} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import Home from './component/home/Home';
import Settings from './component/settings/Settings';
import {
  cacheConfig,
  cachePackets,
  cacheProfile,
  cacheUsers,
} from './logic/caching';

const Tab = createBottomTabNavigator();

const App = () => {
  const [profileWarningVisible, setProfileWarningVisible] = useState(false);
  const [connectionWarningVisible, setConnectionWarningVisible] =
    useState(false);
  const showProfileWarning = useSelector(
    state => state.interface.showProfileWarning,
  );
  const connected = useSelector(state => state.social.connected);

  useEffect(() => {
    setProfileWarningVisible(showProfileWarning);
  }, [showProfileWarning]);

  useEffect(() => {
    setConnectionWarningVisible(!connected);
  }, [connected]);

  return (
    <>
      <Cache />
      <Tab.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{
          headerShown: false,
        }}>
        <Tab.Screen
          name="HomeScreen"
          component={Home}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({color, size}) => (
              <MaterialCommunityIcons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="SettingsScreen"
          component={Settings}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({color, size}) => (
              <MaterialCommunityIcons name="cog" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
      <Snackbar
        visible={profileWarningVisible}
        onDismiss={() => setProfileWarningVisible(false)}
        action={{
          label: 'Hide',
          onPress: () => setProfileWarningVisible(false),
        }}>
        You are not logged in! Please visit the profile settings.
      </Snackbar>
      <Snackbar
        visible={connectionWarningVisible}
        onDismiss={() => setConnectionWarningVisible(false)}
        action={{
          label: 'Hide',
          onPress: () => setConnectionWarningVisible(false),
        }}>
        You're offline, check your connection and try again!
      </Snackbar>
    </>
  );
};

const Cache = () => {
  const doneLoading = useSelector(state => state.config.doneLoading);
  const config = useSelector(state => state.config);
  const profile = useSelector(state => state.social.profile);
  const contacts = useSelector(state => state.social.contacts);
  const users = useSelector(state => state.social.users);
  const userCache = useSelector(state => state.social.userCache);
  const packets = useSelector(state => state.social.packets);

  useEffect(() => {
    if (doneLoading) {
      cacheConfig();
    }
  }, [doneLoading, config]);

  useEffect(() => {
    if (doneLoading && profile) {
      cacheProfile();
    }
  }, [doneLoading, profile]);

  useEffect(() => {
    if (doneLoading) {
      cacheUsers();
    }
  }, [doneLoading, contacts, users, userCache]);

  useEffect(() => {
    if (doneLoading) {
      cachePackets();
    }
  }, [doneLoading, packets]);

  return <></>;
};

export default App;
