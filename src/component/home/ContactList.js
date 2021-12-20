import {useNetInfo} from '@react-native-community/netinfo';
import React, {Suspense, useEffect, useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Card,
  TouchableRipple,
  withTheme,
} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {fetchContactProfiles} from '../../logic/contacts';
import {fetchImageSource} from '../../logic/utils';

const ContactList = ({navigation}) => {
  const [refreshing, setRefreshing] = useState(false);
  const contacts = useSelector(state => state.social.contacts);
  const userCache = useSelector(state => state.social.userCache);
  const netInfo = useNetInfo();

  const updateState = () => {
    setRefreshing(true);
    fetchContactProfiles()
      .catch(() => {})
      .then(() => setRefreshing(false));
  };

  useEffect(() => {
    updateState();
  }, [netInfo]);

  return (
    <ScrollView
      style={styles.contactScreen}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => updateState()}
        />
      }>
      {contacts &&
        userCache &&
        Object.keys(userCache)
          .filter(userId => contacts.includes(userId))
          .map(userId => {
            return (
              <Suspense key={userId} fallback={<ActivityIndicator />}>
                <UserProfile
                  navigation={navigation}
                  profile={userCache[userId]}
                />
              </Suspense>
            );
          })}
    </ScrollView>
  );
};

const UserProfile = withTheme(({theme, navigation, profile}) => {
  const [source, setSource] = useState();

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
      <>
        {source && source.read() ? (
          <Avatar.Image size={32} source={{uri: source && source.read()}} />
        ) : (
          <Avatar.Text size={32} label={profile.username.substr(0, 2)} />
        )}
      </>
    );
  };

  const startChat = () => {
    navigation.popToTop();
    navigation.navigate('Chat', {
      userId: profile.id,
    });
  };

  const disabled = !profile.publicKey;

  return (
    <TouchableRipple disabled={disabled} onPress={startChat}>
      <Card style={styles.profileCard}>
        <Card.Title
          titleStyle={{
            color: disabled ? theme.colors.disabled : theme.colors.text,
          }}
          title={profile.username ? profile.username : profile.id}
          subtitle={
            disabled ? 'This user has not yet used the chat.' : undefined
          }
          left={avatar}
        />
      </Card>
    </TouchableRipple>
  );
});

export default ContactList;

const styles = StyleSheet.create({
  contactScreen: {
    marginVertical: 2,
  },
  profileCard: {
    padding: 4,
    marginVertical: 2,
    marginHorizontal: 4,
  },
  cardContent: {},
});
