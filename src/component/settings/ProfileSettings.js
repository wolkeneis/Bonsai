import React, {Suspense, useCallback, useEffect, useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  List,
  Paragraph,
  Switch,
  Text,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {deleteCache} from '../../logic/caching';
import {
  fetchProfile,
  fetchProfileConnections,
  logout as remoteLogout,
  providers,
  updatePrivacy,
} from '../../logic/profile';
import {fetchImageSource} from '../../logic/utils';
import {setPrivateProfile, setProfile} from '../../redux/socialSlice';

const ProfileSettings = ({navigation}) => {
  const [refreshing, setRefreshing] = useState();
  const profile = useSelector(state => state.social.profile);
  const dispatch = useDispatch();

  const updateProfile = useCallback(() => {
    setRefreshing(true);
    fetchProfile().then(profile => {
      dispatch(setProfile(profile));
      dispatch(setPrivateProfile(profile ? profile.private : false));
      setRefreshing(false);
    });
  }, [dispatch]);

  useEffect(() => {
    updateProfile();
  }, [updateProfile]);

  return (
    <ScrollView
      style={styles.settings}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => updateProfile()}
        />
      }>
      {profile !== undefined && (
        <Suspense fallback={<ActivityIndicator size="large" />}>
          {profile !== null ? (
            <Profile navigation={navigation} profile={profile} />
          ) : (
            <Card style={styles.profileCard}>
              <Card.Cover source={{uri: 'https://picsum.photos/900'}} />
              <Card.Actions>
                <Button onPress={() => navigation.navigate('Login')}>
                  Log in
                </Button>
              </Card.Actions>
            </Card>
          )}
        </Suspense>
      )}
    </ScrollView>
  );
};

const Profile = ({navigation, profile}) => {
  const [source, setSource] = useState();
  const connections = useSelector(state => state.social.connections);
  const privateProfile = useSelector(state => state.social.privateProfile);

  useEffect(() => {
    if (profile.avatar) {
      setSource(fetchImageSource(profile.avatar));
    }
    fetchProfileConnections();
    return () => {
      setSource();
    };
  }, [profile]);

  const onPrivacyChange = value => {
    updatePrivacy(value);
  };

  const avatar = () => {
    return source && source.read() ? (
      <Avatar.Image size={48} source={{uri: source && source.read()}} />
    ) : (
      <Avatar.Text size={48} label={profile.username.substr(0, 2)} />
    );
  };

  const logout = () => {
    remoteLogout().then(() => navigation.popToTop());
    deleteCache();
  };

  return (
    <>
      <Card style={styles.profileCard}>
        <Card.Cover
          source={{uri: `https://picsum.photos/seed/${profile.id}/800`}}
        />
        <Card.Title
          title={profile.username}
          subtitle={profile.id}
          left={avatar}
        />
        <Card.Content style={styles.cardContent}>
          <Switch value={privateProfile} onValueChange={onPrivacyChange} />
          <Paragraph>Private Profile</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={logout}>Log out</Button>
        </Card.Actions>
      </Card>
      {connections !== undefined && (
        <>
          {connections !== null ? (
            <>
              {providers.map(provider => (
                <Connection
                  key={provider.id}
                  navigation={navigation}
                  provider={provider}
                  connection={connections[provider.id]}
                />
              ))}
            </>
          ) : (
            <Text>Error</Text>
          )}
        </>
      )}
    </>
  );
};

const Connection = ({navigation, provider, connection}) => {
  const [source, setSource] = useState();

  useEffect(() => {
    if (connection && connection.avatar) {
      setSource(fetchImageSource(connection.avatar));
    }
    return () => {
      setSource();
    };
  }, [connection]);

  return (
    <Card style={styles.profileCard}>
      <Card.Title
        title={provider.name}
        left={() => <List.Icon size={32} icon={provider.icon} />}
      />
      {connection && connection.username && connection.avatar ? (
        <Card.Content style={styles.cardContent}>
          {source && source.read() ? (
            <Avatar.Image
              style={styles.connectionAvatar}
              size={32}
              source={{uri: source && source.read()}}
            />
          ) : (
            <Avatar.Text
              style={styles.connectionAvatar}
              size={32}
              label={connection.username.substr(0, 2)}
            />
          )}
          <Paragraph>{connection.username}</Paragraph>
        </Card.Content>
      ) : (
        <></>
      )}
      <Card.Actions>
        {connection && connection.username && connection.avatar ? (
          <>
            <Button onPress={() => {}}>Disconnect</Button>
            <Button
              onPress={() =>
                navigation.navigate('Login', {provider: provider})
              }>
              Update
            </Button>
          </>
        ) : (
          <Button
            onPress={() => navigation.navigate('Login', {provider: provider})}>
            Connect
          </Button>
        )}
      </Card.Actions>
    </Card>
  );
};

export default ProfileSettings;

const styles = StyleSheet.create({
  settings: {
    marginVertical: 4,
  },
  profileCard: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionAvatar: {
    margin: 4,
  },
});
