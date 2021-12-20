import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Colors, Text} from 'react-native-paper';
import {default as QRCodeComponent} from 'react-native-qrcode-svg';
import {useSelector} from 'react-redux';

const QRCode = ({}) => {
  const profile = useSelector(state => state.social.profile);
  const [uri, setUri] = useState();
  const [svg, setSvg] = useState();

  useEffect(() => {
    if (svg) {
      svg.toDataURL(url => setUri('data:image/png;base64,' + url));
    }
  }, [svg]);

  return (
    <View style={styles.qrcodeScreen}>
      <View
        style={{
          ...styles.frame,
          backgroundColor: Colors.white,
        }}>
        <Image resizeMode="contain" style={styles.qrcode} source={{uri: uri}} />
        {!uri && (
          <QRCodeComponent value={profile.id} size={200} getRef={setSvg} />
        )}
        <Text style={styles.username}>{profile.username}</Text>
      </View>
    </View>
  );
};

export default QRCode;

const styles = StyleSheet.create({
  qrcodeScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    borderRadius: 16,
    margin: 64,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrcode: {
    margin: 16,
    width: '100%',
    aspectRatio: 1,
  },
  username: {
    margin: 16,
    color: Colors.black,
    fontSize: 22,
  },
});
