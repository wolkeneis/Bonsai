import {useNetInfo} from '@react-native-community/netinfo';
import React, {Suspense, useEffect, useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  TouchableRipple,
  withTheme,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchContactProfiles,
  removeContact as removeRemoteContact,
} from '../../logic/contacts';
import {fetchImageSource} from '../../logic/utils';
import {removeContact} from '../../redux/socialSlice';

const ContactSettings = ({theme, navigation}) => {
  const [refreshing, setRefreshing] = useState(false);
  const profile = useSelector(state => state.social.profile);
  const contacts = useSelector(state => state.social.contacts);
  const userCache = useSelector(state => state.social.userCache);
  const netInfo = useNetInfo();

  useEffect(() => {
    if (profile) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableRipple onPress={() => navigation.navigate('QR Code')}>
            <MaterialCommunityIcons name={'qrcode'} size={28} />
          </TouchableRipple>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => <></>,
      });
    }
  }, [navigation, profile]);

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
    <>
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
      <TouchableRipple
        onPress={() => navigation.navigate('QR Code Scanner')}
        style={{
          ...styles.qrcodescanner,
          backgroundColor: theme.colors.primary,
        }}>
        <MaterialCommunityIcons name={'plus'} size={28} />
      </TouchableRipple>
    </>
  );
};

const UserProfile = withTheme(({theme, navigation, profile}) => {
  const [source, setSource] = useState();
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
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
          <Avatar.Image size={32} source={{uri: source && source.read()}} />
        ) : (
          <Avatar.Text size={32} label={profile.username.substr(0, 2)} />
        )}
      </TouchableRipple>
    );
  };

  const remove = () => {
    removeRemoteContact(profile.id).then(successful => {
      if (successful) {
        dispatch(removeContact(profile.id));
      }
    });
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
        {showAdvancedOptions && (
          <>
            <Card.Content style={styles.cardContent} />
            <Card.Actions>
              <Button onPress={remove}>Remove Contact</Button>
            </Card.Actions>
          </>
        )}
      </Card>
    </TouchableRipple>
  );
});

export default withTheme(ContactSettings);

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
  qrcodescanner: {
    position: 'absolute',
    padding: 16,
    bottom: 16,
    right: 16,
    borderRadius: 16,
  },
});
