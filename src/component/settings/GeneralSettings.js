import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Card, Paragraph, Switch} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {setUseAllConnectionTypes} from '../../redux/configSlice';

const GeneralSettings = () => {
  const useAllConnectionTypes = useSelector(
    state => state.config.useAllConnectionTypes,
  );
  const dispatch = useDispatch();

  return (
    <ScrollView style={styles.generalScreen}>
      <Card style={styles.settingsCard}>
        <Card.Cover source={{uri: 'https://picsum.photos/900'}} />
        <Card.Title title="Internet" />
        <Card.Content>
          <View style={styles.switchContainer}>
            <Switch
              value={!useAllConnectionTypes}
              onChange={() =>
                dispatch(setUseAllConnectionTypes(!useAllConnectionTypes))
              }
            />
            <Paragraph>Use WiFi only</Paragraph>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default GeneralSettings;

const styles = StyleSheet.create({
  generalScreen: {
    marginVertical: 2,
  },
  settingsCard: {
    padding: 4,
    marginVertical: 2,
    marginHorizontal: 4,
  },
  switchContainer: {
    margin: 8,
    flexDirection: 'row',
  },
});
