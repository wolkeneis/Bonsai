import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {Text, TouchableRipple, withTheme} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {validate} from 'uuid';
import {sendPacket} from '../../logic/signal';

const Chat = ({navigation, userId}) => {
  const [messages, setMessages] = useState();
  const userCache = useSelector(state => state.social.userCache);
  const packets = useSelector(state => state.social.packets);

  useEffect(() => {
    if (userId && validate(userId) && userCache[userId]) {
      navigation.setOptions({headerTitle: userCache[userId].username});
    }
  }, [navigation, userId, userCache]);

  useEffect(() => {
    if (userId && validate(userId) && packets) {
      setMessages(
        Object.keys(packets)
          .map(packetId => packets[packetId])
          .filter(packet => packet.userId === userId)
          .sort((a, b) => (a.date > b.date ? 1 : -1)),
      );
    }
    return () => {
      setMessages([]);
    };
  }, [packets, userId]);

  return (
    <View style={styles.chatScreen}>
      <ScrollView style={styles.messages}>
        {messages && (
          <>
            {messages.map(packet => (
              <Message key={packet.packetId} packet={packet} />
            ))}
          </>
        )}
      </ScrollView>
      {userId && validate(userId) && <MessageField userId={userId} />}
    </View>
  );
};

const Message = withTheme(({theme, packet}) => {
  return (
    <View
      style={{
        ...styles.message,
        ...(packet.sender
          ? {
              ...styles.sent,
              backgroundColor: theme.colors.primary,
            }
          : {
              ...styles.received,
              backgroundColor: theme.colors.accent,
            }),
      }}>
      <Text style={styles.messageText}>{packet.message}</Text>
      <Text style={styles.date}>{new Date(packet.date).toLocaleString()}</Text>
    </View>
  );
});

const MessageField = withTheme(({theme, userId}) => {
  const [message, setMessage] = useState();

  const sendMessage = () => {
    if (message) {
      sendPacket(message, userId);
      setMessage('');
    }
  };

  return (
    <View
      style={{
        ...styles.messageField,
        backgroundColor: theme.colors.background,
        borderTopColor: theme.colors.disabled,
      }}>
      <TextInput
        style={styles.textField}
        value={message}
        onSubmitEditing={sendMessage}
        onChangeText={message => setMessage(message)}
        placeholder="Message..."
      />
      <TouchableRipple style={styles.sendButton} onPress={sendMessage}>
        <MaterialCommunityIcons name={'send'} size={28} />
      </TouchableRipple>
    </View>
  );
});

export default Chat;

const styles = StyleSheet.create({
  chatScreen: {
    flex: 1,
  },
  messages: {
    flex: 1,
    paddingVertical: 3,
    flexDirection: 'column-reverse',
  },
  message: {
    borderRadius: 8,
    marginVertical: 3,
    marginHorizontal: 6,
    padding: 8,
    maxWidth: '75%',
  },
  sent: {
    alignSelf: 'flex-end',
  },
  received: {
    alignSelf: 'flex-start',
  },
  messageText: {},
  date: {
    fontSize: 12,
  },
  messageField: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  textField: {
    flex: 1,
  },
  sendButton: {
    alignSelf: 'center',
    marginRight: 8,
  },
});
