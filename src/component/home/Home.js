import {useNetInfo} from '@react-native-community/netinfo';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {Suspense, useEffect, useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet} from 'react-native';
import 'react-native-get-random-values';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Colors,
  Snackbar,
  TouchableRipple,
  withTheme,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {
  addContact as addRemoteContact,
  removeContact as removeRemoteContact,
} from '../../logic/contacts';
import {initializeKeys} from '../../logic/signal';
import {fetchImageSource} from '../../logic/utils';
import {addContact, removeContact} from '../../redux/socialSlice';
import Chat from './Chat';
import ContactList from './ContactList';

const Stack = createNativeStackNavigator();

const Home = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Contacts" component={ContactScreen} />
    </Stack.Navigator>
  );
};

const HomeScreen = withTheme(({theme, navigation}) => {
  const [refreshing, setRefreshing] = useState(false);
  const users = useSelector(state => state.social.users);
  const userCache = useSelector(state => state.social.userCache);
  const showSecurityWarning = useSelector(
    state => state.interface.showSecurityWarning,
  );
  const [securityWarningVisible, setSecurityWarningVisible] = useState(false);
  const netInfo = useNetInfo();

  const updateState = () => {
    setRefreshing(true);
    initializeKeys().then(() => setRefreshing(false));
  };

  useEffect(() => {
    updateState();
  }, [netInfo]);

  useEffect(() => {
    setSecurityWarningVisible(showSecurityWarning);
  }, [showSecurityWarning]);

  return (
    <>
      <ScrollView
        style={styles.homeScreen}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => updateState()}
          />
        }>
        {users &&
          userCache &&
          Object.keys(userCache)
            .filter(userId => users.includes(userId))
            .map(userId => {
              const user = userCache[userId];
              return (
                <Suspense key={userId} fallback={<ActivityIndicator />}>
                  <UserProfile navigation={navigation} profile={user} />
                </Suspense>
              );
            })}
      </ScrollView>
      <TouchableRipple
        onPress={() => navigation.navigate('Contacts')}
        style={{
          ...styles.contacts,
          backgroundColor: theme.colors.primary,
        }}>
        <MaterialCommunityIcons name={'contacts'} size={28} />
      </TouchableRipple>
      <Snackbar
        visible={securityWarningVisible}
        onDismiss={() => setSecurityWarningVisible(false)}
        action={{
          label: 'Hide',
          onPress: () => setSecurityWarningVisible(false),
        }}>
        Security issues found! Please visit the security settings.
      </Snackbar>
    </>
  );
});

const ChatScreen = ({navigation, route}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <Chat
        navigation={navigation}
        userId={
          route.params && route.params.userId ? route.params.userId : undefined
        }
      />
    </Suspense>
  );
};

const ContactScreen = ({navigation}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <ContactList navigation={navigation} />
    </Suspense>
  );
};

const UserProfile = ({navigation, profile}) => {
  const [source, setSource] = useState();
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const contacts = useSelector(state => state.social.contacts);
  const dispatch = useDispatch();

  useEffect(() => {
    if (profile.avatar) {
      setSource(fetchImageSource(profile.avatar));
    }
    return () => {
      setSource();
    };
  }, [profile]);

  const avatar = () => {
    return (
      <TouchableRipple
        onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}>
        {source && source.read() ? (
          <Avatar.Image size={48} source={{uri: source && source.read()}} />
        ) : (
          <Avatar.Text size={48} label={profile.username.substr(0, 2)} />
        )}
      </TouchableRipple>
    );
  };

  const add = () => {
    addRemoteContact(profile.id).then(successful => {
      if (successful) {
        dispatch(addContact(profile.id));
      }
    });
  };

  const remove = () => {
    removeRemoteContact(profile.id).then(successful => {
      if (successful) {
        dispatch(removeContact(profile.id));
      }
    });
  };

  return (
    <TouchableRipple
      onPress={() =>
        navigation.navigate('Chat', {
          userId: profile.id,
        })
      }>
      <Card style={styles.profileCard}>
        <Card.Title
          title={profile.username ? profile.username : profile.id}
          left={avatar}
        />
        {showAdvancedOptions && (
          <>
            <Card.Content style={styles.cardContent} />
            <Card.Actions>
              {!contacts.includes(profile.id) ? (
                <Button onPress={add}>Add Contact</Button>
              ) : (
                <Button onPress={remove}>Remove Contact</Button>
              )}
            </Card.Actions>
          </>
        )}
      </Card>
    </TouchableRipple>
  );
};

export default Home;

const styles = StyleSheet.create({
  homeScreen: {
    marginVertical: 2,
  },
  profileCard: {
    padding: 4,
    marginVertical: 2,
    marginHorizontal: 4,
  },
  cardContent: {},
  contacts: {
    position: 'absolute',
    padding: 16,
    bottom: 16,
    right: 16,
    borderRadius: 16,
  },
  decryptionKeyModal: {
    margin: 16,
  },
  warning: {
    color: Colors.amber800,
  },
});
